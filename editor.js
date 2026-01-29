 const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const previewVideo = document.getElementById("previewVideo");

fileInput.addEventListener("change", function() {
    const file = this.files[0];

    if (!file) return;

    const fileType = file.type;

    // If image
    if (fileType.startsWith("image/")) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
        previewVideo.style.display = "none";
    }

    // If video
    else if (fileType.startsWith("video/")) {
        previewVideo.src = URL.createObjectURL(file);
        previewVideo.style.display = "block";
        previewImage.style.display = "none";
    }
});