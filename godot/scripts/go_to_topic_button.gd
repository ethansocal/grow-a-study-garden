extends Button

@onready var optionButton := $"../OptionButton" as OptionButton

func _on_pressed() -> void:
	var selectedId = optionButton.get_selected_id()
	if selectedId == 0:
		return
	var selectedText = optionButton.get_item_text(selectedId)
	MathGameManager.selectedTopic = selectedText
	get_tree().change_scene_to_file("res://scenes/math/math_question_generator.tscn")
	
