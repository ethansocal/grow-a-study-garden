shader_type canvas_item;

// Uniforms to control the shader from the Inspector
uniform sampler2D noise_texture : hint_default_black;
uniform float saturation_amount : hint_range(0.0, 1.0) = 0.2;
uniform vec2 scroll_speed = vec2(0.05, 0.03);
// Add a uniform for the pixel art grid size
uniform vec2 pixel_grid_size = vec2(16.0, 16.0);

// Helper function to convert RGB color space to HSV
// H (Hue) is stored in x, S (Saturation) in y, V (Value) in z
vec3 rgb_to_hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10; // Epsilon to avoid division by zero
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Helper function to convert HSV color space back to RGB
vec3 hsv_to_rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void fragment() {
    // 1. Get the original color of the pixel from the screen
    vec4 original_color = texture(TEXTURE, UV);

    // 2. Calculate the "target" scrolling UV
    // TIME is a built-in Godot variable.
    // We add to UV to move right (x) and down (y).
    vec2 target_noise_uv = UV;

    // 3. Pixelate the noise UV coordinates
    // Calculate the size of one "pixel" in UV space (0.0 to 1.0)
    vec2 uv_pixel_size = 1.0 / pixel_grid_size;
    // Snap the target UV to the grid, sampling the center of the "pixel"
    vec2 pixelated_noise_uv = (floor(target_noise_uv / uv_pixel_size) + 0.5) * uv_pixel_size;

    // 4. Sample the noise texture using the pixelated UV
    // We only need one channel (e.g., .r) since noise is usually greyscale.
    float noise_value = texture(noise_texture, pixelated_noise_uv).r;

    // 5. Map the noise value from [0.0, 1.0] to [-1.0, 1.0]
    // This allows the noise to both increase and decrease saturation.
    float mapped_noise = (noise_value * 2.0) - 1.0;

    // 6. Calculate the final saturation offset
    float saturation_offset = mapped_noise * saturation_amount;

    // 7. Convert the original color to HSV
    vec3 hsv = rgb_to_hsv(original_color.rgb);

    // 8. Apply the offset to the saturation (the 'y' component)
    hsv.y += saturation_offset;

    // 9. Clamp the saturation to keep it in the valid [0.0, 1.0] range
    hsv.y = clamp(hsv.y, 0.0, 1.0);

    // 10. Convert the modified HSV color back to RGB
    vec3 final_rgb = hsv_to_rgb(hsv);

    // 11. Set the final color, preserving the original alpha
    COLOR = vec4(final_rgb, original_color.a);
}