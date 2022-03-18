
<template>
  <div class="q-pa-md">
    <q-btn label="Add Person" color="primary" class="" @click="addPerson" />
    <q-table
      title="Persons"
      dense
      class="q-mt-lg"
      :rows="rows"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:body-cell-photo="props">
        <q-td :props="props">
          <img style="height:50px; width50px" :src="props.row.photo" />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat color="green" icon="edit" @click="editItem(props.row)" />
          <q-btn
            flat
            color="red"
            icon="delete"
            @click="deleteItem(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="dialog" @hide="onDialogHide">
      <q-card class="formStyle">
        <q-card-section>
          <q-form @submit="save" class="q-gutter-md">
            <q-input
              filled
              v-model="editedItem.name"
              label="Enter the person's name"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
            <q-select
              filled
              v-model="editedItem.gender"
              :options="genders"
              label="Gender"
              :rules="[
                (val) => (val && val.length > 0) || 'Please select a gender',
              ]"
            />
            <q-file
              v-if="editedIndex === -1"
              filled
              bottom-slots
              label="Photo"
              counter
              @input="onFileSelected"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop />
              </template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click.stop="model = null"
                  class="cursor-pointer"
                />
              </template>
            </q-file>

            <img
              :style="
                showImage ? 'height: 200px; width 200px' : 'height: 0; width 0'
              "
              src=""
              ref="imgFile"
              id="imgFile"
            />

            <div>
              <q-btn
                :loading="btnSaving"
                label="Save"
                type="submit"
                color="primary"
              >
                <template v-slot:loading>
                  <q-spinner-hourglass />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { usePersonsStore } from "@/stores/persons";
import { v4 as uuidv4 } from "uuid";
import { useQuasar } from "quasar";

export default {
  data: (vm) => ({
    dialog: false,
    genders: ["Male", "Female"],
    showImage: false,
    btnSaving: false,
    columns: [
      {
        name: "id",
        required: true,
        label: "ID",
        align: "left",
        field: (row) => row.id,
        style: "max-width: 10vw",
        sortable: true,
      },
      {
        name: "name",
        required: true,
        label: "Name",
        align: "left",
        field: (row) => row.name,
        sortable: true,
      },
      {
        name: "gender",
        align: "left",
        label: "Gender",
        field: (row) => row.gender,
        sortable: true,
      },
      {
        name: "photo",
        align: "left",
        label: "Photo",
        field: (row) => row.image,
        sortable: false,
      },
      {
        name: "actions",
        align: "center",
        label: "Actions",
        field: (row) => row.id,
        sortable: false,
      },
    ],
    rows: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      gender: "",
      photo: null,
    },
    defaultItem: {
      name: "",
      gender: "",
      photo: null,
    },
  }),
  created() {
    this.initialize();
  },
  setup() {
    const $q = useQuasar();
    const persons = usePersonsStore();

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
      this.rows = [...this.persons.persons];
      await faceapi.nets.ssdMobilenetv1.loadFromUri("assets/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("assets/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("assets/models");
      await faceapi.nets.tinyFaceDetector.loadFromUri("assets/models");
      console.log(faceapi.nets);
    },
    addPerson() {
      this.dialog = true;
      this.editedIndex = -1;
    },
    onDialogHide() {
      this.dialog = false;
      this.showImage = false;
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
    },
    onFileSelected(event) {
      console.log("input event ", event);
      var selectedFile = event.target.files[0];
      var reader = new FileReader();

      var imgTag = document.getElementById("imgFile");
      console.log("imgTag", imgTag);
      let vm = this;
      reader.onload = function (e) {
        imgTag.src = e.target.result;
        vm.editedItem.photo = e.target.result;
      };

      reader.readAsDataURL(selectedFile);
      this.showImage = true;
    },
    editItem(item) {
      this.editedIndex = this.rows.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async getFaceDescriptor(label) {
      var imgTag = document.getElementById("imgFile");
      const fullFaceDescription = await faceapi
        .detectSingleFace(imgTag)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!fullFaceDescription) {
        throw new Error(`no faces detected for ${label}`);
      }
      console.log("fd: ", fullFaceDescription);

      const faceDescriptor = [fullFaceDescription.descriptor];
      let labeledFaceDescriptor = new faceapi.LabeledFaceDescriptors(
        label,
        faceDescriptor
      );

      console.log("found ", labeledFaceDescriptor);
      return labeledFaceDescriptor;
    },
    async save() {
      if (this.editedIndex === -1) {
        this.btnSaving = true;
        console.log("saving");
        console.log(this.editedItem);
        let label = this.editedItem.name;
        let faceDescriptor = await this.getFaceDescriptor(label);
        let person = {
          id: uuidv4(),
          name: label,
          photo: this.editedItem.photo,
          gender: this.editedItem.gender,
          faceDescriptor: faceDescriptor,
        };
        this.persons.addPerson(person);
        this.rows.push(person);
        this.btnSaving = false;
        this.dialog = false;
        this.showNotification("Person added successfully", "green");
      } else {
        this.editedItem.faceDescriptor.label = this.editedItem.name;
        Object.assign(this.rows[this.editedIndex], this.editedItem);
        this.persons.editPerson(this.editedItem);
        this.showNotification("Person edited successfully", "green");
        this.btnSaving = false;
        this.dialog = false;
      }
    },
    async deleteItem(item) {
      console.log("delete", item);
      const index = this.rows.indexOf(item);
      confirm("Are you sure you want to remove this person from the list?") &&
        (await this.persons.removePerson(item.id));
      this.rows.splice(index, 1);
      this.showNotification("Person removed successfully", "green");
    },
  },
};
</script>



<style scoped>
.formStyle {
  width: 70vw;
  height: 70vh;
}
</style>