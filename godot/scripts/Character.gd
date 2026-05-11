extends CharacterBody2D

@export var SPEED = 150.0
var direction = "down"
var walking = false

@onready var animatedSprite = $AnimatedSprite2D

@export var current_tool: DataTypes.Tools = DataTypes.Tools.None

func get_input():
	var vertical = Input.get_axis("ui_up", "ui_down")
	var horizontal = Input.get_axis("ui_left", "ui_right")
	return Vector2(horizontal, vertical)

func _physics_process(_delta):
	velocity = get_input() * SPEED
	if not walking:
		if Input.is_action_just_pressed("ui_down"):
			animatedSprite.animation = "walk_down"
		elif Input.is_action_just_pressed("ui_up"):
			animatedSprite.animation = "walk_up"
		elif Input.is_action_just_pressed("ui_right"):
			animatedSprite.animation = "walk_right"
		elif Input.is_action_just_pressed("ui_left"):
			animatedSprite.animation = "walk_left"
	walking = velocity != Vector2(0, 0)
	if not walking and animatedSprite.animation.begins_with("walk"):
		animatedSprite.animation = animatedSprite.animation.replace("walk", "stand")
	animatedSprite.play()
	move_and_slide()

func _ready() -> void:
	ToolManager.tool_selected.connect(on_tool_selected)
	
func on_tool_selected(tool: DataTypes.Tools) -> void:
	current_tool = tool
