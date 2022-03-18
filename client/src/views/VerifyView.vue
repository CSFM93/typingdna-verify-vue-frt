
<template>
  <main class="flex justify-center fixed-center">
    <div>
      <q-card v-show="!addedEmail" style="width: 50vw; height: 50vh">
        <div class="q-pt-xl" style="">
          <q-form @submit="addEmail" class="q-mx-lg">
            <p class="text-h6 text-primary">
              Enter your email to verify that you are an actual human
            </p>
            <q-input
              filled
              class=""
              v-model="email"
              label="Enter your email"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) =>
                  (val && val.includes('@')) || 'Please type a valid email',
              ]"
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
        </div>
      </q-card>
      <q-card v-show="addedEmail" style="width: 50vw; height: 50vh">
        <div class="justify-center fixed-center" style="">
          <q-btn
            class="typingDNA-verify"
            color="primary"
            :data-typingdna-client-id="typingDNADataAttributes.clientId"
            :data-typingdna-application-id="
              typingDNADataAttributes.applicationId
            "
            :data-typingdna-payload="typingDNADataAttributes.payload"
            data-typingdna-callback-fn="typeDNACbFn"
          >
            Verify 2FA with TypingDNA
          </q-btn>
        </div>
      </q-card>
    </div>
  </main>
</template>

<script>
import axios from "axios";
import { useTypingPatternStore } from "@/stores/typingPattern";
import router from "@/router";
import { useQuasar } from "quasar";
export default {
  data: (vm) => ({
    typingDNADataAttributes: {},
    email: "",
    URL: import.meta.env.VITE_SERVER,
    addedEmail: false,
    showImage: false,
    btnSaving: false,
  }),
  created() {
    this.initialize();
    console.log(this.URL);
  },
  setup() {
    const $q = useQuasar();
    const typingPattern = useTypingPatternStore();
    return {
      showNotification(message, color) {
        $q.notify({
          message: message,
          color: color,
        });
      },
      typingPattern
    };
  },
  methods: {
    initialize() {
      window.typeDNACbFn = this.typeDNACbFn;
    },
    addEmail() {
      axios
        .get(`${this.URL}/verifyAccount?email=${this.email}`)
        .then((res) => {
          console.log("axios", res.data);
          this.typingDNADataAttributes = res.data;
          this.addedEmail = true;
          console.log(
            "typingDNADataAttributes: ",
            this.typingDNADataAttributes
          );
          this.showNotification("Ready to verify", "green");
        })
        .catch((err) => {
          console.log(err);
          this.showNotification(
            "Something went wrong when trying to verify",
            "red"
          );
        });
    },
    async typeDNACbFn(payload) {
      console.log("call back", payload);
      let url = `${this.URL}/validateOTP`;
      if (payload.success === 1) {
        let data = {
          email: this.email,
          otp: payload.otp,
        };
        axios
          .post(url, { data: data })
          .then((res) => {
            console.log(res.data);
            if (res.data.validatedOTP.success === 1) {
              this.showNotification(
                "Typing pattern verified successfully",
                "green"
              );
              setTimeout(() => {
                this.typingPattern.verify();
                router.push({ name: "Home" });
              }, 3000);
            } else {
              this.showNotification(
                "Something went wrong when trying to verify",
                "red"
              );
            }
          })
          .catch((err) => {
            console.log(err);
            this.showNotification(
              "Something went wrong when trying to verify",
              "red"
            );
          });
      } else {
        this.showNotification(
          "Something went wrong when trying to verify",
          "red"
        );
      }
    },
  },
};
</script>
