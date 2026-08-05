<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['password']) || !isset($input['accounts'])) {
    echo json_encode(['status' => 'error', 'message' => 'Payload inválido']);
    exit();
}

$password = trim($input['password']);
$accounts = $input['accounts'];

$matched_account = null;

foreach ($accounts as $acc) {
    $hash = trim($acc['hash']);
    if (empty($hash)) continue;
    
    $valid = false;
    
    // Verifica Bcrypt ou Argon2 nativamente no PHP (PHP 7.2+ suporta Argon2)
    if (password_verify($password, $hash)) {
        $valid = true;
    }
    // Verifica MD5
    elseif (strtolower(md5($password)) === strtolower($hash)) {
        $valid = true;
    }
    // Verifica texto puro (fallback)
    elseif ($hash === $password || strtolower($hash) === strtolower($password)) {
        $valid = true;
    }
    
    if ($valid) {
        $matched_account = $acc;
        break;
    }
}

if ($matched_account) {
    echo json_encode(['status' => 'success', 'account' => $matched_account]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Senha incorreta. Verifique sua senha.']);
}
?>
