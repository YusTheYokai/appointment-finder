<?php
    /**
     * Klasse für das Validieren von Werten.
     */
    class Validator {

        private $validateables;
        private $validationResults = [];

        // KONSTRUKTOR

        public function __construct(Validateable ...$validateables) {
            $this->validateables = $validateables;
        }

        // METHODEN

        /**
         * Validiert alle übergebenen Validateables und speichert
         * die Ergebnisse in $validationResults.
         */
        public function validate() {
            foreach ($this->validateables as $validateable) {
                array_push($this->validationResults, $validateable->validate());
            }
        }

        /**
         * Fügt ein ValidationResult hinzu.
         * @param ValidationResult $validationResult
         */
        public function addValidationResult($validationResult) {
            array_push($this->validationResults, $validationResult);
        }

        /**
         * Prüft, ob eine Validierung fehlgeschlagen hat.
         */
        public function hasFailed() {
            foreach ($this->validationResults as $validationResult) {
                if ($validationResult->isFailed()) {
                    return TRUE;
                }
            }
            return FALSE;
        }

        /**
         * Generiert die Fehlermeldungen, welche als Antwort
         * zurück an den Client geschickt werden können.
         */
        public function generateErrorMessages() {
            $messages = [];
            foreach ($this->validationResults as $validationResult) {
                foreach ($validationResult->getErrorMessages() as $errorMessage) {
                    array_push($messages, $validationResult->getName() . ": " . $errorMessage);
                }
            }
            return $messages;
        }
    }

    /**
     * Klasse für das Resultat einer Validierung.
     */
    class ValidationResult {

        private $name;
        private $failed = FALSE;
        private $errorMessages = [];

        // KONSTRUKTOR
        public function __construct($name) {
            $this->name = $name;
        }

        // METHODEN

        /**
         * Fügt eine Fehlermeldung hinzu und setzt das Resultat auf fehlgeschlagen.
         * @param string $errorMessage Key für das Übersetzen der Fehlermeldung
         */
        public function addErrorMessage($errorMessage) {
            $this->failed = TRUE;
            array_push($this->errorMessages, $errorMessage);
        }

        // GETTER

        public function getName() {
            return $this->name;
        }

        public function isFailed() {
            return $this->failed;
        }

        public function getErrorMessages() {
            return $this->errorMessages;
        }
    }

    /**
     * Abstrakte Klasse für das Validieren von Werten.
     */
    abstract class Validateable {

        protected $value;
        protected $validationResult;

        // KONSTRUKTOR

        public function __construct($value, $name) {
            $this->value = $value;
            $this->validationResult = new ValidationResult($name);
        }

        // METHODEN

        /**
         * Validiert den übergebenen Wert.
         * @return ValidationResult das Validierungsresultat.
         */
        public abstract function validate();
    }

    /**
     * Validateable für Zahlen.
     */
    class NumberValidateable extends Validateable {

        private $min;
        private $max;

        // KONSTRUKTOR

        public function __construct($value, $name, $min, $max) {
            parent::__construct($value, $name);
            $this->min = $min;
            $this->max = $max;
        }

        // METHODEN

        public function validate() {
            if (!isset($this->value)) {
                $this->validationResult->addErrorMessage("Must not be empty.");
                return $this->validationResult;
            }

            if ($this->value < $this->min) {
                $this->validationResult->addErrorMessage("Is too small. Minimum of " . $this->min . " is required.");
            } else if ($this->value > $this->max) {
                $this->validationResult->addErrorMessage("is too big. Maximum of " . $this->max . " is allowed.");
            }

            return $this->validationResult;
        }
    }

    /**
     * Validateable für Text.
     */
    class TextValidateable extends Validateable {

        private $minLength;
        private $maxLength;
        private $optional;

        // KONSTRUKTOR

        public function __construct($value, $name, $minLength, $maxLength, $optional = FALSE) {
            parent::__construct($value, $name);
            $this->minLength = $minLength;
            $this->maxLength = $maxLength;
            $this->optional = $optional;
        }

        // METHODEN

        public function validate() {
            if (!isset($this->value)) {
                if ($this->optional) {
                    return $this->validationResult;
                } else {
                    $this->validationResult->addErrorMessage("Must not be empty.");
                    return $this->validationResult;
                }
            }

            $length = strlen($this->value);
            if ($length < $this->minLength) {
                $this->validationResult->addErrorMessage("Is too short. Minimum of " . $this->minLength . " character(s) is/are required.");
            } else if ($length > $this->maxLength) {
                $this->validationResult->addErrorMessage("Is too long. Maximum of " . $this->maxLength . " characters are allowed.");
            }

            return $this->validationResult;
        }
    }

    /**
     * Validateable für Arrays.
     */
    class ArrayValidateable extends Validateable {

        private $minSize;
        private $maxSize;

        // KONSTRUKTOR

        public function __construct($value, $name, $minSize, $maxSize) {
            parent::__construct($value, $name);
            $this->minSize = $minSize;
            $this->maxSize = $maxSize;
        }

        // METHODEN

        public function validate() {
            if (!isset($this->value)) {
                $this->validationResult->addErrorMessage("Must not be empty.");
                return $this->validationResult;
            }

            $length = count($this->value);
            if ($length < $this->minSize) {
                $this->validationResult->addErrorMessage("Number of values is too small. Minimum of " . $this->minSize . " value(s) is/are required.");
            } else if ($length > $this->maxSize) {
                $this->validationResult->addErrorMessage("Number of values is too big. Maximum of " . $this->maxSize . " values are allowed.");
            }

            return $this->validationResult;
        }
    }
?>
