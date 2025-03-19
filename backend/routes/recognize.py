from fastapi import FastAPI, File, UploadFile
import model_inference

app = FastAPI()

@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = model_inference.run_inference_on_image(image_bytes)
    return result
