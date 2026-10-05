<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

#[Route('/api/auth')]
class Auth extends Controller
{
    public function before_action()
    {
        $this->call->library('api');

        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $this->call->database();
    }

    #[Route('/{action?}', methods: ['OPTIONS'])]
    public function options($action = null)
    {
        http_response_code(204);
        exit;
    }

    #[Post('/register')]
    public function register()
    {
        $this->api->rate_limit('register:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 3600);
        $input = $this->api->body();
        $name = trim(html_entity_decode((string) ($input['name'] ?? ''), ENT_QUOTES, 'UTF-8'));
        $email = strtolower(trim(html_entity_decode((string) ($input['email'] ?? ''), ENT_QUOTES, 'UTF-8')));
        $password = html_entity_decode((string) ($input['password'] ?? ''), ENT_QUOTES, 'UTF-8');

        if ($name === '' || strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
            $this->api->respond_error('Enter a name and a valid email address.', 422);
        }
        if (strlen($password) < 10 || strlen($password) > 200) {
            $this->api->respond_error('Password must be between 10 and 200 characters.', 422);
        }

        $existing = $this->db->raw('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [$email, $name])->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            $this->api->respond_error('An account with that name or email already exists.', 409);
        }

        $this->db->raw(
            'INSERT INTO users (username, email, password, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
            [$name, $email, password_hash($password, PASSWORD_DEFAULT), 'user']
        );
        $userId = $this->db->last_id();
        $tokens = $this->api->issue_tokens(['id' => $userId, 'role' => 'user']);

        $this->api->respond([
            'message' => 'Account created.',
            'user' => ['id' => (int) $userId, 'name' => $name, 'email' => $email],
            'tokens' => $tokens,
        ], 201);
    }

    #[Post('/login')]
    public function login()
    {
        $this->api->rate_limit('login:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 300);
        $input = $this->api->body();
        $email = strtolower(trim(html_entity_decode((string) ($input['email'] ?? ''), ENT_QUOTES, 'UTF-8')));
        $password = html_entity_decode((string) ($input['password'] ?? ''), ENT_QUOTES, 'UTF-8');

        $user = $this->db->raw(
            'SELECT id, username, email, password, role FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
            [$email]
        )->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            $this->api->respond_error('The email or password is incorrect.', 401);
        }

        $tokens = $this->api->issue_tokens(['id' => $user['id'], 'role' => $user['role']]);
        $this->api->respond([
            'message' => 'Signed in.',
            'user' => ['id' => (int) $user['id'], 'name' => $user['username'], 'email' => $user['email']],
            'tokens' => $tokens,
        ]);
    }

    #[Post('/refresh')]
    public function refresh()
    {
        $input = $this->api->body();
        $token = trim((string) ($input['refresh_token'] ?? ''));
        if ($token === '') {
            $this->api->respond_error('A refresh token is required.', 422);
        }
        $this->api->refresh_access_token($token);
    }

    #[Post('/logout', middleware: ['auth'])]
    public function logout()
    {
        $input = $this->api->body();
        $token = trim((string) ($input['refresh_token'] ?? ''));
        if ($token !== '') {
            $this->api->revoke_refresh_token($token);
        }
        $this->api->respond(['message' => 'Signed out.']);
    }
}
