extends CharacterBody2D

const SPEED = 300.0
var direction = "down"
var walking = false

@onready var animatedSprite = $AnimatedSprite2D

func get_input():
	var vertical = Input.get_axis("move_up", "move_down")
	var horizontal = Input.get_axis("move_left", "move_right")
	return Vector2(horizontal, vertical)

func _physics_process(_delta):
	velocity = get_input() * SPEED
	if not walking:
		if Input.is_action_just_pressed("move_down"):
			animatedSprite.animation = "walk_down"
		elif Input.is_action_just_pressed("move_up"):
			animatedSprite.animation = "walk_up"
		elif Input.is_action_just_pressed("move_right"):
			animatedSprite.animation = "walk_right"
		elif Input.is_action_just_pressed("move_left"):
			animatedSprite.animation = "walk_left"
	walking = velocity != Vector2(0, 0)
	if not walking and animatedSprite.animation.begins_with("walk"):
		animatedSprite.animation = animatedSprite.animation.replace("walk", "stand")
	animatedSprite.play()
	move_and_slide()
