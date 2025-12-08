extends Control

@onready var mathQuestionTextBox = %MathQuestion

func _ready() -> void:
	mathQuestionTextBox.text = "What is " + str(randi()) + " + " + str(randi())
	print("Generating " + MathGameManager.selectedTopic + " question")
