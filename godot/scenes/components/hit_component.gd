class_name HitComponent
extends Area2D

@export var tool: DataTypes.Tools = DataTypes.Tools.None
@export var hit_damage: int = 1


signal on_hurt

func _on_area_entered(area: Area2D) -> void:
	pass
