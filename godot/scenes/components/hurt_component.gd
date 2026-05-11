class_name HurtComponent
extends Area2D

enum Tools {
	None,
	Thing,
	WaterCrops,
	ChopWood,
	PlantCorn,
}

@export var tool : Tools = Tools.None

signal on_hurt(hit_damage: int)


func _on_area_entered(area: Area2D) -> void:
	pass # Replace with function body.
