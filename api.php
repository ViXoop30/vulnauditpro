<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$db_config = [
    "host" => getenv('DB_HOST') ?: "localhost",
    "user" => getenv('DB_USER') ?: "root",
    "pass" => getenv('DB_PASS') ?: "",
    "name" => getenv('DB_NAME') ?: "vuln_db"
];
$conn = new mysqli($db_config['host'], $db_config['user'], $db_config['pass'], $db_config['name']);

if ($conn->connect_error) die(json_encode(["error" => "DB Fail"]));

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'get_users':
        $res = $conn->query("SELECT id, username, role, status FROM users");
        $users = [];
        while($row = $res->fetch_assoc()) $users[] = $row;
        echo json_encode($users);
        break;
    case 'save_report':
        $target = $conn->real_escape_string($data['target_url']);
        $json = $conn->real_escape_string(json_encode($data['report']));
        $userId = (int)$data['userId'];
        $sql = "INSERT INTO reports (target_url, report_json, created_by) VALUES ('$target', '$json', $userId)";
        if ($conn->query($sql)) echo json_encode(["success" => true]);
        else echo json_encode(["error" => $conn->error]);
        break;
    default:
        echo json_encode(["status" => "active"]);
}
$conn->close();
?>