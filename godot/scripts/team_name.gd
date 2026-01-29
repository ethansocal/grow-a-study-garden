extends RichTextLabel

var showingTeamName = true
@onready var animationPlayer = $AnimationPlayer

func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if showingTeamName:
			animationPlayer.play("To Name")
		else:
			animationPlayer.play_backwards("To Name")
		showingTeamName = !showingTeamName
