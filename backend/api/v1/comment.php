<?php
    require_once "../../validation.php";

    $method = $_SERVER["REQUEST_METHOD"];
    if ($method === "POST") {
        $comment = json_decode(file_get_contents("php://input"));

        $validator = new Validator(
            new TextValidateable($comment->content, "Content", 1, 140),
            new TextValidateable($comment->username, "Username", 3, 30),
            new NumberValidateable($comment->appointmentId, "Appointment", 0, PHP_INT_MAX)
        );

        $validator->validate();
        if ($validator->hasFailed()) {
            http_response_code(422);
            echo json_encode($validator->generateErrorMessages());
            exit;
        }

        require_once "../../db/logIntoDatabase.php";

        $query = "INSERT INTO comment (CONTENT, USERNAME, APPOINTMENT_ID) VALUES (?, ?, ?);";
        $statement = $db->prepare($query);
        $statement->bind_param("ssi", $comment->content, $comment->username, $comment->appointmentId);
        $successful = $statement->execute();

        if (!$successful) {
            http_response_code(500);
            echo "Error";
            exit;
        }

        http_response_code(201);
        header("Content-Type: application/json");
        echo json_encode($comment);
    } else {
        http_response_code(405);
        header("Allow: GET POST");
        echo "Method Not Allowed";
        exit;
    }
?>
