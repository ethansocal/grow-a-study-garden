extends TextureRect


@export var scroll_speed = 300;
var offset = 0;

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	var noise = (material as ShaderMaterial).get_shader_parameter("noise_texture") as NoiseTexture2D
	offset = offset + delta * scroll_speed
	noise.noise.offset.x = round(offset / 300) * 300
