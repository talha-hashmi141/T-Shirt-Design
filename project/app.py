from flask import Flask, render_template, request, url_for
from diffusers import StableDiffusionPipeline
import torch
import os

app = Flask(__name__)

# Ensure a folder to save images
output_dir = "static/images"
os.makedirs(output_dir, exist_ok=True)

# Load the Stable Diffusion model (using the same model as in Colab)
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)

# Enable attention slicing for memory optimization
pipe.enable_attention_slicing()

# Move the model to CPU (you can adjust this to use GPU if needed)
pipe.to("cpu")

@app.route("/", methods=["GET", "POST"])
def index():
    image_url = None
    if request.method == "POST":
        # Get the prompt from the form
        prompt = request.form["prompt"]
        
        # Base prompt for generating patterns/textures for T-shirts
        base_prompt = "a seamless textile pattern with vibrant colors, suitable for 3D T-shirt design, featuring "
        final_prompt = base_prompt + prompt

        # Generate image using the final prompt
        image = pipe(final_prompt, height=256, width=256).images[0]

        # Save the generated image
        output_path = os.path.join(output_dir, "generated_image.png")
        image.save(output_path)

        # Create URL for the generated image
        image_url = url_for("static", filename="images/generated_image.png")

    return render_template("index.html", image_url=image_url)

if __name__ == "__main__":
    app.run(debug=True)
