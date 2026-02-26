const fileInput = document.getElementById("fileInput");
const numberBox = document.getElementById("numberBox");
const totalDisplay = document.getElementById("total");
const duplicateWarning = document.getElementById("duplicateWarning");
const convertBtn = document.getElementById("convertBtn");

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    numberBox.value = e.target.result;
    processNumbers();
  };
  reader.readAsText(file);
});

numberBox.addEventListener("input", processNumbers);

function cleanNumber(raw) {
  let num = raw.replace(/[^\d+]/g, "");

  if (num.startsWith("0")) {
    num = "+62" + num.slice(1);
  } else if (!num.startsWith("+")) {
    num = "+" + num;
  }

  return num;
}

function processNumbers() {
  const lines = numberBox.value.split("\n");
  let validNumbers = [];
  let duplicates = 0;

  const seen = new Set();

  lines.forEach(line => {
    let digitsOnly = line.replace(/\D/g, "");
    if (digitsOnly.length >= 10) {
      let formatted = cleanNumber(line);
      if (seen.has(formatted)) {
        duplicates++;
      } else {
        seen.add(formatted);
        validNumbers.push(formatted);
      }
    }
  });

  totalDisplay.textContent = "Total valid number: " + validNumbers.length;

  if (duplicates > 0) {
    duplicateWarning.textContent = "⚠️ " + duplicates + " duplicate numbers detected";
  } else {
    duplicateWarning.textContent = "";
  }

  return validNumbers;
}

convertBtn.addEventListener("click", function () {
  const contactNameInput = document.getElementById("contactName").value.trim();
  const fileNameInput = document.getElementById("fileName").value.trim();

  let numbers = processNumbers();

  if (numbers.length === 0) {
    alert("Tidak ada nomor valid!");
    return;
  }

  let contactName = contactNameInput || fileNameInput;
  if (!contactName) {
    alert("Nama kontak atau nama file harus diisi!");
    return;
  }

  let padding = numbers.length > 9 ? 2 : 1;

  let vcfContent = "";

  numbers.forEach((num, index) => {
    let numberIndex = (index + 1).toString().padStart(padding, "0");

    vcfContent += 
`BEGIN:VCARD
VERSION:3.0
FN:${contactName} ${numberIndex}
TEL:${num}
END:VCARD
`;
  });

  const blob = new Blob([vcfContent], { type: "text/vcard" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = (fileNameInput || contactName) + ".vcf";
  link.click();
});
