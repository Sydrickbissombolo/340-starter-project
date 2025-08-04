document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-check-changes]");

  forms.forEach((form) => {
    const originalData = new FormData(form);
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", (e) => {
      const currentData = new FormData(form);
      let changed = false;

      for (let [key, value] of originalData.entries()) {
        if (currentData.get(key) !== value) {
          changed = true;
          break;
        }
      }

      if (!changed) {
        e.preventDefault();
        alert("Please make a change before submitting.");
      }
    });
  });
});
