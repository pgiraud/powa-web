import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/lib/iconsets/mdi-svg";
import {
  mdiAlert,
  mdiCalendar,
  mdiCancel,
  mdiClockOutline,
  mdiCog,
  mdiHome,
  mdiMagnifyMinusOutline,
  mdiReload,
  mdiPower,
  mdiClose,
} from "@mdi/js";

export const icons = {
  mdiAlert,
  mdiCalendar,
  mdiCancel,
  mdiClockOutline,
  mdiCog,
  mdiHome,
  mdiMagnifyMinusOutline,
  mdiPower,
  mdiReload,
  mdiClose,
};

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: "#859145",
    secondary: "#b0bec5",
    accent: "#8c9eff",
    error: "#b71c1c",
  },
};

const opts = {
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "myCustomLightTheme",
    themes: {
      myCustomLightTheme,
    },
  },
};

export default new createVuetify(opts);
