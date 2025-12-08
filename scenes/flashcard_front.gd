extends Control



func _input(event: InputEvent) -> void:
	if event.is_action_pressed("flip_flashcard"):
		get_tree().change_scene_to_file("res://scenes/flashcard_back.tscn")
