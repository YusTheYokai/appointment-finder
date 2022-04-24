<?php
    require_once "../../validation.php";

    $method = $_SERVER["REQUEST_METHOD"];
    if ($method === "POST") {
        $appointment = json_decode(file_get_contents("php://input"));

        $validator = new Validator(
            new TextValidateable($appointment->title, "Title", 3, 100),
            new TextValidateable($appointment->location, "Location", 3, 100),
            new TextValidateable($appointment->description, "Description", 0, 1000, TRUE),
            new NumberValidateable($appointment->duration, "Duration", 5, PHP_INT_MAX),
            new TextValidateable($appointment->creator, "Creator", 3, 30),
            new ArrayValidateable($appointment->dateTimes, "Date-Times", 1, PHP_INT_MAX)
        );

        $validator->validate();
        if ($validator->hasFailed()) {
            http_response_code(422);
            echo json_encode($validator->generateErrorMessages());
            exit;
        }

        require_once "../../db/logIntoDatabase.php";

        $query = "INSERT INTO appointment (TITLE, LOCATION, DESCRIPTION, DURATION, CREATOR) VALUES (?, ?, ?, ?, ?);";
        $statement = $db->prepare($query);
        $statement->bind_param("sssis", $appointment->title, $appointment->location, $appointment->description, $appointment->duration, $appointment->creator);
        $successful = $statement->execute();

        if (!$successful) {
            http_response_code(500);
            echo "Error";
            exit;
        }

        $result = $db->query("SELECT LAST_INSERT_ID();");
        $id = $result->fetch_row()[0];

        foreach ($appointment->dateTimes as $dateTime) {
            $query = "INSERT INTO appointment_choice (DATE_TIME, APPOINTMENT_ID) VALUES (?, ?);";
            $statement = $db->prepare($query);
            $statement->bind_param("ii", $dateTime, $id);
            $statement->execute();
        }

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($appointment);
    } else if ($method === "GET") {
        // TODO: Get Request handeln
        
        require_once "../../db/logIntoDatabase.php";

        $query = "SELECT * FROM appointment";
        $result = $db->query($query);

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } else {
        http_response_code(405);
        header("Allow: GET POST");
        echo "Method Not Allowed";
        exit;
    }
?>
