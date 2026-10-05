<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

class Rename_product_table
{
    private $_lava;

    public function __construct()
    {
        $this->_lava = lava_instance();
        $this->_lava->call->dbforge();
        $this->_lava->call->database();
    }

    public function up()
    {
        if (!$this->_lava->dbforge->table_exists('products') && $this->_lava->dbforge->table_exists('product')) {
            $this->_lava->dbforge->rename_table('product', 'products');
        }

        if ($this->_lava->dbforge->table_exists('products')) {
            $this->_lava->dbforge->modify_column('products', [
                'product_name' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            ]);
        }
    }

    public function down()
    {
        if (!$this->_lava->dbforge->table_exists('product') && $this->_lava->dbforge->table_exists('products')) {
            $this->_lava->dbforge->rename_table('products', 'product');
        }
    }
}
