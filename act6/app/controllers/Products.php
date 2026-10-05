<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

#[Route('/api/products')]
class Products extends Controller
{
    public function before_action()
    {
        $this->call->library('api');

        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $this->call->database();
        $this->call->model('ProductModel');
    }

    #[Route('/{id?}', methods: ['OPTIONS'])]
    public function options($id = null)
    {
        http_response_code(204);
        exit;
    }

    #[Get('/', middleware: ['auth'])]
    public function index()
    {
        $products = $this->ProductModel->order_by('created_at', 'DESC');
        $this->api->respond(['data' => $products ?: []]);
    }

    #[Get('/{id}', middleware: ['auth'])]
    public function show($id)
    {
        $product = $this->ProductModel->find((int) $id);
        if (!$product) {
            $this->api->respond_error('Product not found.', 404);
        }
        $this->api->respond(['data' => $product]);
    }

    #[Post('/', middleware: ['auth'])]
    public function create()
    {
        $data = $this->validated_product($this->api->body());
        $id = $this->ProductModel->insert($data);
        if (!$id) {
            $this->api->respond_error('Product could not be created.', 500);
        }
        $this->api->respond(['message' => 'Product created.', 'data' => $this->ProductModel->find($id)], 201);
    }

    #[Route('/{id}', methods: ['PUT', 'PATCH'], middleware: ['auth'])]
    public function update($id)
    {
        $productId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$productId || !$this->ProductModel->find($productId)) {
            $this->api->respond_error('Product not found.', 404);
        }

        $data = $this->validated_product($this->api->body(), true);
        if (!$data) {
            $this->api->respond_error('Provide at least one valid product field to update.', 422);
        }
        $this->ProductModel->update($productId, $data);
        $this->api->respond(['message' => 'Product updated.', 'data' => $this->ProductModel->find($productId)]);
    }

    #[Delete('/{id}', middleware: ['auth'])]
    public function delete($id)
    {
        $productId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$productId || !$this->ProductModel->find($productId)) {
            $this->api->respond_error('Product not found.', 404);
        }
        $this->ProductModel->delete($productId);
        $this->api->respond(['message' => 'Product deleted.']);
    }

    private function validated_product(array $input, $partial = false)
    {
        $allowed = ['product_name', 'description', 'price', 'quantity'];
        $data = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $input)) {
                $data[$field] = is_string($input[$field])
                    ? trim(html_entity_decode($input[$field], ENT_QUOTES, 'UTF-8'))
                    : $input[$field];
            }
        }

        if (!$partial || array_key_exists('product_name', $data)) {
            if (!isset($data['product_name']) || $data['product_name'] === '' || strlen($data['product_name']) > 100) {
                $this->api->respond_error('Product name is required and must be 100 characters or fewer.', 422);
            }
        }
        if (!$partial || array_key_exists('description', $data)) {
            if (!isset($data['description']) || $data['description'] === '') {
                $this->api->respond_error('Description is required.', 422);
            }
        }
        if (!$partial || array_key_exists('price', $data)) {
            if (!isset($data['price']) || !is_numeric($data['price']) || (float) $data['price'] < 0 || (float) $data['price'] >= 100000000) {
                $this->api->respond_error('Price must be a positive amount with up to 8 digits before the decimal.', 422);
            }
            $data['price'] = number_format((float) $data['price'], 2, '.', '');
        }
        if (!$partial || array_key_exists('quantity', $data)) {
            if (!isset($data['quantity']) || filter_var($data['quantity'], FILTER_VALIDATE_INT) === false || (int) $data['quantity'] < 0) {
                $this->api->respond_error('Quantity must be a whole number of zero or more.', 422);
            }
            $data['quantity'] = (int) $data['quantity'];
        }

        return $data;
    }
}
