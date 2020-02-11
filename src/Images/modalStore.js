import { writable } from "svelte/store";
export let modalStore = writable({});
export const open = (Component, props) => {
  modalStore.set({ isOpen: true, Component, props });
};
export const close = () => {
  modalStore.set({ isOpen: false, Component: null, props: {} });
};