<?php
    require_once "../../validation.php";

    $method = $_SERVER["REQUEST_METHOD"];
    if ($method === "POST") {
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

        $query = "INSERT INTO date_time_vote (DATE_TIME_ID, USERNAME) VALUES (?, ?);";
        $statement = $db->prepare($query);
        $statement->bind_param("is", $vote->dateTimeId, $vote->username);
        $statement->execute();

        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode($vote);
    } else if ($method === "GET") {
        require_once "../../db/logIntoDatabase.php";

        $query = "SELECT * FROM appointment";
        $result = $db->query($query);

        $appointments = $result->fetch_all(MYSQLI_ASSOC);
        $appointmentsAndDateTimes = [];
        foreach ($appointments as $appointment) {
            $query = "SELECT * FROM appointment_choice WHERE APPOINTMENT_ID = ?;";
            $statement = $db->prepare($query);
            $statement->bind_param("i", $appointment["ID"]);
            $statement->execute();
            $dateTimes = array_map(function($dateTime) { return $dateTime["DATE_TIME"]; }, $statement->get_result()->fetch_all(MYSQLI_ASSOC));
            $appointment["DATE_TIMES"] = $dateTimes;
            array_push($appointmentsAndDateTimes, $appointment);
        }

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($appointmentsAndDateTimes);
    } else if ($method === "DELETE") {

    } else {
        http_response_code(405);
        header("Allow: GET POST");
        echo "Method Not Allowed";
        exit;
    }
?>
