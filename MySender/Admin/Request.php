<?php

namespace MySender\Admin;

use MySender\App\Config;

class Request
{
    private $controller;
    private $endpoint;
    public $response;

    public function __construct()
    {
        $this->initHeaders();
        $this->controller = new Admin();
        $this->endpoint = $_REQUEST['action'] ?? null;
    }

    private function initHeaders()
    {
        header("Access-Control-Allow-Orgin: *");
        header("Access-Control-Allow-Methods: *");
        header("Content-Type: application/json");
    }

    /**
     * @throws \Exception
     */
    private function checkSecret()
    {
        $secret = $_GET['secret'] ?? null;
        if ($secret !== Config::get()->admin->secret) {
            throw new \Exception('access denied');
        }
    }

    /**
     * @param $methodName
     * @return array
     * @throws \ReflectionException
     */
    private function getMethodArgNames($methodName)
    {
        $class = new \ReflectionClass($this->controller);
        $method = $class->getMethod($methodName);
        $result = [];
        foreach ($method->getParameters() as $param) {
            $result[] = $param->name;
        }
        return $result;
    }

    /**
     * @param $methodName
     * @return array
     * @throws \ReflectionException
     */
    private function fetchMethodArgs($methodName)
    {
        $args = null;
        foreach ($this->getMethodArgNames($methodName) as $arg) {
            foreach ($_REQUEST as $key => $value) {
                if ($value === 'false') {
                    $value = false;
                }
                if ($value === 'true') {
                    $value = true;
                }
                if ($key == $arg) {
                    $args[] = $value;
                }
            }
        }
        return $args;
    }


    function processRequest()
    {
        try {
            $this->checkSecret();
            $data = null;
            if (!$this->endpoint) throw new \Exception('Endpoint not exists');
            if (method_exists($this->controller, $this->endpoint)) {
                $params = $this->fetchMethodArgs($this->endpoint);
                if ($params) {
                    //Метод с параметрами
                    $data = call_user_func_array([$this->controller, $this->endpoint], $params);
                } else {
                    //Метод без параметров
                    $data = $this->controller->{$this->endpoint}();
                }

                //Записываем результат выполнения метода
                $this->response($data);
            } else {
                throw new \Exception("No Endpoint: $this->endpoint");
            }
        } catch (\Exception $e) {
            $this->responseError($e);
        }
        finally {
            if (empty($this->response)) {
                $this->response = json_encode([
                    'error' => 'unknown error',
                    'success' => false,
                ]);
            }
        }
    }

    private function response($data)
    {
        $this->response = json_encode([
            'data' => $data,
            'success' => true,
        ]);
    }

    private function responseError(\Exception $e)
    {
        $this->response = json_encode([
            'error' => $e->getMessage(),
            'success' => false,
        ]);
    }
}
