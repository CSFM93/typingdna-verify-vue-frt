
<template>
  <div class="flex justify-center centers" style="height: 85vh">
    <q-card class="my-card q-mt-lg" style="width: 60vw; height: 80vh">
      <div class="q-mt-lg" id="img-Container" style="">
        <img
          src="/assets/images/placeholder-image.webp"
          ref="imgFile"
          id="imgFile"
        />
        <canvas class="" id="myCanvas" />
      </div>
      <q-card-actions class="justify-center centers">
        <div style="">
          <q-file
            color="primary"
            filled
            label="Upload photo"
            @input="onFileSelected"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </div>
        <q-btn class="q-ml-lg" color="primary" @click="recognize"
          >Recognize</q-btn
        >
      </q-card-actions>
    </q-card>
  </div>
</template>


<script>
import { usePersonsStore } from "@/stores/persons";
import { useQuasar } from "quasar";

export default {
  data: (vm) => ({
    showImage: true,
    btnRecognizing: false,
    labeledFaceDescriptors: [],
  }),
  created() {
    this.initialize();
  },
  setup() {
    const persons = usePersonsStore();
    const $q = useQuasar();

    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      persons,
    };
  },
  methods: {
    async initialize() {
      console.log(this.persons.persons);
      await faceapi.nets.ssdMobilenetv1.loadFromUri("assets/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("assets/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("assets/models");
      await faceapi.nets.tinyFaceDetector.loadFromUri("assets/models");
      console.log(faceapi.nets);

      let labeledFaceDescriptors = this.persons.persons.map((person) => {
        return new faceapi.LabeledFaceDescriptors(person.faceDescriptor.label, [
          new Float32Array(person.faceDescriptor.descriptors[0]),
        ]);
      });

      this.labeledFaceDescriptors = [...labeledFaceDescriptors];
    },
    onFileSelected(event) {
      console.log("input event ", event);
      var selectedFile = event.target.files[0];
      var reader = new FileReader();

      var imgTag = document.getElementById("imgFile");
      console.log("imgTag", imgTag);
      reader.onload = function (e) {
        imgTag.src = e.target.result;
      };

      reader.readAsDataURL(selectedFile);
      this.showImage = true;
      this.clearCanvas();
    },
    clearCanvas() {
      let canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    },
    async recognize() {
      let input = document.getElementById("imgFile");
      let canvas = document.getElementById("myCanvas");
      this.showImage = false;

      const faceMatcher = new faceapi.FaceMatcher(this.labeledFaceDescriptors);

      const results = await faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
      console.log("result", results.length);

      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          const face = faceMatcher.findBestMatch(results[i].descriptor);
          console.log(`result-${i} : `, face);
          const box = results[i].detection.box;
          console.log("detection", results[i].detection);
          if (face._label !== "unknown") {
            const text = face._label;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: text,
              boxColor: "green",
            });
            drawBox.draw(canvas);
            this.showNotification("Person successfully recognized", "green");
          } else {
            const text = "";
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: text,
              boxColor: "red",
            });
            drawBox.draw(canvas);
          }
        }
      }
    },
  },
};
</script>

<style scoped>
#imgFile {
  height: 60vh;
  width: 45vw;
  margin-left: 7.5vw;
  position: absolute;
  z-index: 1;
}

#img-Container {
  display: inline-block;
  height: 60vh;
  width: 50vw;
}

#myCanvas {
  position: relative;
  height: 60vh;
  width: 45vw;
  margin-left: 7.5vw;
  z-index: 20;
}
</style>
