<?php
// proxy.php - Simple PHP Proxy for Groq/OpenAI APIs

// 1. Determine the target URL based on the request path
$requestUri = $_SERVER['REQUEST_URI'];
// Remove the script path if it's being executed directly or via rewrite
// We assume the rewrite logic sends /groq-api/... to this script
// Expected pattern handling:
// /groq-api/openai/v1/chat/completions -> https://api.groq.com/openai/v1/chat/completions

$targetBase = "";
$pathSuffix = "";

if (strpos($requestUri, '/groq-api/') !== false) {
    $targetBase = "https://api.groq.com";
    $parts = explode('/groq-api', $requestUri);
    $pathSuffix = isset($parts[1]) ? $parts[1] : '';
} else if (strpos($requestUri, '/openai-api/') !== false) {
    $targetBase = "https://api.openai.com";
    $parts = explode('/openai-api', $requestUri);
    $pathSuffix = isset($parts[1]) ? $parts[1] : '';
}

if (empty($targetBase)) {
    http_response_code(400);
    echo json_encode(["error" => "Unknown proxy target"]);
    exit;
}

$targetUrl = $targetBase . $pathSuffix;

// 2. Prepare headers
$requestHeaders = [];
if (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
} else {
    // Fallback for non-Apache environments
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) === 'HTTP_') {
            $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
            $requestHeaders[$header] = $value;
        }
    }
}

// Filter headers to forward
$forwardHeaders = [];
foreach ($requestHeaders as $key => $value) {
    if (preg_match('/^(Authorization|Content-Type|Accept|User-Agent)$/i', $key)) {
        $forwardHeaders[] = "$key: $value";
    }
}

// 3. Prepare payload
$method = $_SERVER['REQUEST_METHOD'];
$body = file_get_contents('php://input');

// 4. Execute cURL request
$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
curl_setopt($ch, CURLOPT_HEADER, true); // Get response headers

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    http_response_code(502);
    echo json_encode(["error" => "Proxy Error: " . curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Split headers and body
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);
curl_close($ch);

// 5. Forward response headers
$lines = explode("\r\n", $responseHeaders);
foreach ($lines as $line) {
    if (strpos($line, ':') !== false) {
        header($line);
    }
}
http_response_code($httpCode);

// 6. Output response
echo $responseBody;
