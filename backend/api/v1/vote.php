<?php
    require_once "../../validation.php";

    function voteRequest($query, $code) {
        $vote = json_decode(file_get_contents("php://input"));

        $validator = new Validator(
            new NumberValidateable($vote->dateTimeId, "Date Time", 0, PHP_INT_MAX),
            new TextValidateable($vote->username, "Voter", 3, 30),
        );

        $validator->validate();
        if ($validator->hasFailed()) {
            http_response_code(422);
            echo json_encode($validator->generateErrorMessages());
            exit;
        }

        require_once "../../db/logIntoDatabase.php";

        $statement = $db->prepare($query);
        $statement->bind_param("is", $vote->dateTimeId, $vote->username);
        $statement->execute();

        http_response_code($code);
        header("Content-Type: application/json");
        echo json_encode($vote);
    }

    $method = $_SERVER["REQUEST_METHOD"];
    if ($method === "POST") {
        voteRequest("INSERT INTO date_time_vote (DATE_TIME_ID, USERNAME) VALUES (?, ?);", 201);
    } else if ($method === "DELETE") {
        voteRequest("DELETE FROM date_time_vote WHERE DATE_TIME_ID = ? AND USERNAME = ?;", 200);
    }
?>
