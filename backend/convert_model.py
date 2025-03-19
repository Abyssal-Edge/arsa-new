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


import torch
import torch.onnx
from torchvision import models
import torch.nn as nn

# Load the model architecture (assumed resnet18 for your example)
model = models.resnet18(pretrained=False)

# Adjust the final layer to match the number of classes in your dataset
num_classes = len(class_names)  # Use the correct number of classes
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Load the trained model weights
model.load_state_dict(torch.load('model.pth'))

# Set the model to evaluation mode
model.eval()

# Create a dummy input tensor of the appropriate size (e.g., for ResNet, it’s [1, 3, 224, 224])
# Change the shape if you are using a different model with different input sizes
dummy_input = torch.randn(1, 3, 224, 224)

# Convert the model to ONNX format
onnx_file_path = 'model.onnx'
torch.onnx.export(model, dummy_input, onnx_file_path, 
                  input_names=['input'], output_names=['output'], 
                  opset_version=11, do_constant_folding=True)

print(f"Model successfully converted to ONNX format and saved to {onnx_file_path}")
