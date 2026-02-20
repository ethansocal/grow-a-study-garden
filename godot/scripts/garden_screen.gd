extends Node2D


var token := "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImVkbjN0Szg4U1VaNnVHYWciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2pvdGlveG5sZ291eW9zYWRoYXNuLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ODY5OTZiMC0yYjg4LTQ5M2QtOTAyOS0yMjhiNjczODgzOGQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjE4MDc1LCJpYXQiOjE3NzE2MTQ0NzUsImVtYWlsIjoiZWh0YW5obmVyeUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZWh0YW5obmVyeUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI0ODY5OTZiMC0yYjg4LTQ5M2QtOTAyOS0yMjhiNjczODgzOGQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTYxNDQ3NX1dLCJzZXNzaW9uX2lkIjoiNjUyYmJhNjMtOTQ3Ni00NWUyLWI2MTgtNTdiMzYxOGUwZjNkIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.YsP9X_Dmi6lrhnhKMVLI9mflAuivi2kB3a7cEsypypE"
var anon_key := "sb_publishable_mPGJIcQDyi1ayfj5YEdI5A_gI7Aue7f"

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$HTTPRequest.request("https://jotioxnlgouyosadhasn.supabase.co/rest/v1/study_records?select=*&user_id=eq.486996b0-2b88-493d-9029-228b6738838d", ["authorization: " + token, "apikey: " + anon_key])


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_http_request_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	var json = JSON.parse_string(body.get_string_from_utf8())
	$CanvasLayer/FlashcardCount.text = "Flashcards: " + str(json[0].flashcards)
	$CanvasLayer/MathCount.text = "Math Problems Solved: " + str(json[0].math_problems)
