import numpy as np
import onnx
import onnxruntime as ort
from PIL import Image
import io
from mtcnn import MTCNN
import logging
import cv2
import torch
import torch.nn as nn
from torchvision import transforms

# Initialize MTCNN for face detection
detector = MTCNN()

# Class names list (Actors)
class_names = [
    'abhay_deol', 'adil_hussain', 'ajay_devgn', 'akshay_kumar', 'akshaye_khanna',
    'amitabh_bachchan', 'amjad_khan', 'amol_palekar', 'amole_gupte', 'amrish_puri',
    'anil_kapoor', 'annu_kapoor', 'anupam_kher', 'anushka_shetty', 'arshad_warsi',
    'aruna_irani', 'ashish_vidyarthi', 'asrani', 'atul_kulkarni', 'ayushmann_khurrana',
    'boman_irani', 'chiranjeevi', 'chunky_panday', 'danny_denzongpa', 'darsheel_safary',
    'deepika_padukone', 'deepti_naval', 'dev_anand', 'dharmendra', 'dilip_kumar',
    'dimple_kapadia', 'farhan_akhtar', 'farida_jalal', 'farooq_shaikh', 'girish_karnad',
    'govinda', 'gulshan_grover', 'hrithik_roshan', 'huma_qureshi', 'irrfan_khan',
    'jaspal_bhatti', 'jeetendra', 'jimmy_sheirgill', 'johnny_lever', 'kader_khan',
    'kajol', 'kalki_koechlin', 'kamal_haasan', 'kangana_ranaut', 'kay_kay_menon',
    'konkona_sen_sharma', 'kulbhushan_kharbanda', 'lara_dutta', 'madhavan', 'madhuri_dixit',
    'mammootty', 'manoj_bajpayee', 'manoj_pahwa', 'mehmood', 'mita_vashisht',
    'mithun_chakraborty', 'mohanlal', 'mohnish_bahl', 'mukesh_khanna', 'mukul_dev',
    'nagarjuna_akkineni', 'nana_patekar', 'nandita_das', 'nargis', 'naseeruddin_shah',
    'navin_nischol', 'nawazuddin_siddiqui', 'neeraj_kabi', 'nirupa_roy', 'om_puri',
    'pankaj_kapur', 'pankaj_tripathi', 'paresh_rawal', 'pawan_malhotra', 'pooja_bhatt',
    'prabhas', 'prabhu_deva', 'prakash_raj', 'pran', 'prem_chopra', 'priyanka_chopra',
    'raaj_kumar', 'radhika_apte', 'rahul_bose', 'raj_babbar', 'raj_kapoor', 'rajat_kapoor',
    'rajesh_khanna', 'rajinikanth', 'rajit_kapoor', 'rajkummar_rao', 'rajpal_yadav',
    'rakhee_gulzar', 'ramya_krishnan', 'ranbir_kapoor', 'randeep_hooda', 'rani_mukerji',
    'ranveer_singh', 'ranvir_shorey', 'ratna_pathak_shah', 'rekha', 'richa_chadha',
    'rishi_kapoor', 'riteish_deshmukh', 'sachin_khedekar', 'saeed_jaffrey', 'saif_ali_khan',
    'salman_khan', 'sanjay_dutt', 'sanjay_mishra', 'shabana_azmi', 'shah_rukh_khan',
    'sharman_joshi', 'sharmila_tagore', 'shashi_kapoor', 'shreyas_talpade', 'smita_patil',
    'soumitra_chatterjee', 'sridevi', 'sunil_shetty', 'sunny_deol', 'tabu', 'tinnu_anand',
    'utpal_dutt', 'varun_dhawan', 'vidya_balan', 'vinod_khanna', 'waheeda_rehman',
    'zarina_wahab', 'zeenat_aman'
]

# Load ONNX model for face recognition
onnx_model = onnx.load('model.onnx')
onnx.checker.check_model(onnx_model)
onnx_session = ort.InferenceSession('model.onnx')

# Preprocessing pipeline for face recognition
preprocess = transforms.Compose([
    transforms.Resize((160, 160)),  # Resize to 160x160 as per model requirements
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Logging configuration
logging.basicConfig(level=logging.DEBUG)

def run_inference_on_image(image_data):
    try:
        if isinstance(image_data, io.BytesIO):
            image_data = image_data.read()

        np_arr = np.frombuffer(image_data, np.uint8)
        rgb_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if rgb_image is None:
            raise ValueError("Invalid image data.")

        rgb_image = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2RGB)

        # Detect faces
        faces = detector.detect_faces(rgb_image)
        logging.debug(f"Detected {len(faces)} faces")

        recognized_actors = []

        for face in faces:
            x, y, w, h = face["box"]
            x, y = max(0, x), max(0, y)
            face_img = rgb_image[y : y + h, x : x + w]
            face_img_pil = Image.fromarray(face_img)

            face_input = preprocess(face_img_pil).unsqueeze(0)
            face_input_onnx = face_input.numpy().astype(np.float32)
            inputs = {onnx_session.get_inputs()[0].name: face_input_onnx}

            onnx_output = onnx_session.run(None, inputs)
            predicted_class = np.argmax(onnx_output[0])
            predicted_actor = class_names[predicted_class]  # ✅ Get actor name

            logging.info(f"Face recognized: {predicted_actor}")

            recognized_actors.append(predicted_actor)

        if recognized_actors:
            return {"success": True, "recognized_actors": recognized_actors}

        logging.warning("No recognizable faces found")
        return {"success": False, "recognized_actors": []}

    except Exception as e:
        logging.error(f"Error during inference: {e}")
        return {"success": False, "message": str(e)}
