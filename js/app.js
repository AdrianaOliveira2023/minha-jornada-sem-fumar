const STORAGE_KEY = "smokeFreeJourney";

const defaultData = {
  startDate: null,
  cigarettesPerDay: 20,
  packPrice: 12,
  cigarettesPerPack: 20
};

const achievements = [
  { hours: 1, title: "1 hora", icon: "🌱", text: "Você começou." },
  { hours: 8, title: "8 horas", icon: "✨", text: "Um turno inteiro sem fumar." },
  { hours: 24, title: "24 horas", icon: "🌤️", text: "Seu primeiro dia completo." },
  { hours: 72, title: "3 dias", icon: "🔥", text: "Uau! Três dias de decisão e coragem." },
  { hours: 168, title: "1 semana", icon: "🏆", text: "Uma semana inteira." },
  { hours: 336, title: "2 semanas", icon: "💪", text: "Sua nova rotina ganha força." },
  { hours: 720, title: "1 mês", icon: "🌟", text: "Um mês de liberdade." },
  { hours: 2160, title: "3 meses", icon: "🎯", text: "Um grande marco." },
  { hours: 4320, title: "6 meses", icon: "🚀", text: "Meio ano." },
  { hours: 8760, title: "1 ano", icon: "👑", text: "Um ano inteiro sem fumar." }
];

const messages = [
  { hours: 0, text: "Cada minuto conta. Continue." },
  { hours: 1, text: "Você já começou a provar para si que consegue atravessar a vontade." },
  { hours: 8, text: "Olhe para o tempo que já passou, não apenas para o que ainda falta." },
  { hours: 24, text: "Um dia completo. Isso já é uma conquista real." },
  { hours: 72, text: "Você está construindo uma nova rotina." },
  { hours: 168, text: "Uma semana! Continue protegendo essa conquista." },
  { hours: 720, text: "Um mês sem fumar. Você já percorreu um caminho importante." },
  { hours: 2160, text: "Três meses. Sua história já não é a mesma de quando começou." },
  { hours: 8760, text: "Um ano. Uma coleção inteira de escolhas a seu favor." }
];

const bodyBenefits = [
  { hours: 1, icon: "🌱", title: "Seu corpo começa a responder", text: "Cada hora sem fumar já representa um tempo a mais longe da fumaça e das substâncias do cigarro." },
  { hours: 8, icon: "❤️", title: "Menos sobrecarga para o coração", text: "Você já passou várias horas sem fumar. Seu corpo começa a se adaptar ao tempo longe do cigarro." },
  { hours: 24, icon: "🌤️", title: "Um dia inteiro de mudança", text: "Você chegou a um dia sem fumar. A recuperação continua enquanto seu corpo fica cada vez mais tempo longe da fumaça." },
  { hours: 72, icon: "lungs", title: "Respirar pode ficar mais confortável", text: "Depois dos primeiros dias, a recuperação continua. Você está dando ao seu corpo uma chance de funcionar melhor." },
  { hours: 168, icon: "⚡", title: "Mais disposição no dia a dia", text: "Uma semana sem fumar é uma grande conquista. Algumas pessoas começam a perceber mudanças na disposição e no fôlego." },
  { hours: 336, icon: "💪", title: "Mais fôlego para suas atividades", text: "Duas semanas representam mais tempo de recuperação e uma rotina cada vez mais distante do cigarro." },
  { hours: 720, icon: "🌿", title: "Uma rotina mais leve", text: "Um mês sem fumar. Você já construiu uma sequência importante e continua dando ao seu corpo tempo para se recuperar." },
  { hours: 2160, icon: "🎯", title: "Mais resistência", text: "Três meses sem fumar representam uma grande mudança de rotina. Continue cuidando dessa conquista." },
  { hours: 4320, icon: "🚀", title: "Menos cansaço, mais liberdade", text: "Seis meses sem fumar. Você já deixou o cigarro para trás em muitos momentos do seu dia a dia." },
  { hours: 8760, icon: "👑", title: "1 ano sem fumar!", text: "Uma conquista enorme! Mas sua jornada não termina aqui. Vamos começar o próximo ano?" }
];

let data = loadData();
let breathingTimer = null;
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultData, ...saved } : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function formatMoney(value) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.max(0, Number(value) || 0));

  return formatted.replace(/\s/g, "");
}

function getElapsed() {
  if (!data.startDate) return 0;

  const start = new Date(data.startDate);
  const elapsed = Date.now() - start.getTime();
  return Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
}

function updateDashboard() {
  const elapsed = getElapsed();
  const totalSeconds = Math.floor(elapsed / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHours = elapsed / 3600000;

  $("#days").textContent = days;
  $("#hours").textContent = formatTwoDigits(hours);
  $("#minutes").textContent = formatTwoDigits(minutes);
  $("#seconds").textContent = formatTwoDigits(seconds);

  const cigarettesPerDay = Number(data.cigarettesPerDay) || 0;
  const cigarettesPerPack = Number(data.cigarettesPerPack) || 1;
  const packPrice = Number(data.packPrice) || 0;

  const cigarettesAvoided = (totalHours / 24) * cigarettesPerDay;
  const moneySaved = (cigarettesAvoided / cigarettesPerPack) * packPrice;

  $("#cigarettesAvoided").textContent = Math.floor(cigarettesAvoided).toLocaleString("pt-BR");
  $("#moneySaved").textContent = formatMoney(moneySaved);

  $("#timeSmokeFree").textContent = totalHours < 24
    ? `${Math.floor(totalHours)} ${Math.floor(totalHours) === 1 ? "hora" : "horas"}`
    : `${days} ${days === 1 ? "dia" : "dias"}`;

  const currentMessage = [...messages].reverse().find((message) => totalHours >= message.hours);
  $("#motivationalMessage").textContent = currentMessage?.text || messages[0].text;

  updateBodyBenefit(totalHours);
  updateAchievements(totalHours);
  updateNextAchievement(totalHours);
}

const lungsSvg = `
  <svg class="lungs-icon" viewBox="0 0 64 64" role="img" aria-label="Pulmões">
    <path d="M30 17v15c-5-7-8-14-13-14-5 0-8 7-9 15-1 8 1 18 8 20 6 2 12-3 14-9V32"
          fill="none" stroke="currentColor" stroke-width="4.5"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M34 17v15c5-7 8-14 13-14 5 0 8 7 9 15 1 8-1 18-8 20-6 2-12-3-14-9V32"
          fill="none" stroke="currentColor" stroke-width="4.5"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 10v24" fill="none" stroke="currentColor"
          stroke-width="4.5" stroke-linecap="round"/>
  </svg>`;

function updateBodyBenefit(totalHours) {
  const currentBenefit = [...bodyBenefits].reverse().find((benefit) => totalHours >= benefit.hours);
  if (!currentBenefit) return;

  const icon = $("#bodyBenefitIcon");

  if (currentBenefit.icon === "lungs") {
    icon.innerHTML = lungsSvg;
    icon.setAttribute("data-icon", "lungs");
  } else {
    icon.textContent = currentBenefit.icon;
    icon.setAttribute("data-icon", "emoji");
  }

  $("#bodyBenefitHeading").textContent = currentBenefit.title;
  $("#bodyBenefitText").textContent = currentBenefit.text;
  $("#bodyBenefitTitle").textContent = currentBenefit.hours >= 8760
    ? "Um novo começo"
    : "Cada escolha faz diferença";
}

function updateAchievements(totalHours) {
  const container = $("#achievements");

  container.innerHTML = achievements.map((achievement) => {
    const unlocked = totalHours >= achievement.hours;

    return `<article class="achievement ${unlocked ? "achievement--unlocked" : ""}">
      <div class="achievement__icon" aria-hidden="true">${unlocked ? achievement.icon : "🔒"}</div>
      <strong>${achievement.title}</strong>
      <small>${unlocked ? achievement.text : "Continue para desbloquear."}</small>
    </article>`;
  }).join("");
}

function updateNextAchievement(totalHours) {
  const next = achievements.find((achievement) => totalHours < achievement.hours);
  const previous = [...achievements].reverse().find((achievement) => totalHours >= achievement.hours);
  const progressBar = $("#achievementProgress");
  const track = progressBar.parentElement;

  if (!next) {
    $("#nextAchievementTitle").textContent = "Você chegou a 1 ano!";
    progressBar.style.width = "100%";
    track.setAttribute("aria-valuenow", "100");
    $("#achievementCaption").textContent = "Continue acumulando dias. Sua jornada não termina em um marco.";
    return;
  }

  const startHours = previous?.hours || 0;
  const interval = next.hours - startHours;
  const progress = ((totalHours - startHours) / interval) * 100;
  const clamped = Math.min(100, Math.max(0, progress));
  const remainingHours = Math.max(0, next.hours - totalHours);

  $("#nextAchievementTitle").textContent = next.title;
  progressBar.style.width = `${clamped}%`;
  track.setAttribute("aria-valuenow", String(Math.floor(clamped)));

  if (remainingHours < 24) {
    const hours = Math.ceil(remainingHours);
    $("#achievementCaption").textContent =
      `Falta aproximadamente ${hours} ${hours === 1 ? "hora" : "horas"} para este marco.`;
  } else {
    const days = Math.ceil(remainingHours / 24);
    $("#achievementCaption").textContent =
      `Faltam aproximadamente ${days} ${days === 1 ? "dia" : "dias"} para este marco.`;
  }
}

function openSettings() {
  if (data.startDate) {
    const date = new Date(data.startDate);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    $("#startDate").value = local.toISOString().slice(0, 16);
  } else {
    $("#startDate").value = "";
  }
  $("#cigarettesPerDay").value = data.cigarettesPerDay;
  $("#packPrice").value = Number(data.packPrice).toFixed(2);
  $("#cigarettesPerPack").value = data.cigarettesPerPack;
  $("#settingsModal").showModal();
}

function handleSettingsSubmit(event) {
  event.preventDefault();

  const selectedDate = $("#startDate").value
    ? new Date($("#startDate").value)
    : new Date();

  const cigarettesPerDay = Number($("#cigarettesPerDay").value);
  const packPrice = Number($("#packPrice").value);
  const cigarettesPerPack = Number($("#cigarettesPerPack").value);

  if (Number.isNaN(selectedDate.getTime())) {
    return showToast("Informe uma data válida.");
  }

  if (selectedDate > new Date()) {
    return showToast("A data de início não pode estar no futuro.");
  }

  if (!Number.isFinite(cigarettesPerDay) || cigarettesPerDay < 1) {
    return showToast("Informe uma quantidade válida de cigarros por dia.");
  }

  if (!Number.isFinite(packPrice) || packPrice < 0) {
    return showToast("Informe um preço válido para o maço.");
  }

  if (!Number.isFinite(cigarettesPerPack) || cigarettesPerPack < 1) {
    return showToast("Informe uma quantidade válida de cigarros por maço.");
  }

  const isFirstConfiguration = !data.startDate;

  data = {
    startDate: $("#startDate").value ? selectedDate.toISOString() : (isFirstConfiguration ? new Date().toISOString() : data.startDate),
    cigarettesPerDay,
    packPrice,
    cigarettesPerPack
  };

  saveData();
  updateDashboard();
  $("#settingsModal").close();
  showToast("Dados salvos.");
}

function openCravingModal() {
  $("#cravingModal").showModal();
  startBreathingGuide();
}

function closeCravingModal() {
  if ($("#cravingModal").open) $("#cravingModal").close();

  if (breathingTimer) {
    clearInterval(breathingTimer);
    breathingTimer = null;
  }
}

function startBreathingGuide() {
  const steps = ["Inspire...", "Segure...", "Expire...", "Respire"];
  let index = 0;

  $("#breathingText").textContent = steps[index];

  if (breathingTimer) clearInterval(breathingTimer);

  breathingTimer = setInterval(() => {
    index = (index + 1) % steps.length;
    $("#breathingText").textContent = steps[index];
  }, 2000);
}

async function shareProgress() {
  const days = Math.floor(getElapsed() / 86400000);
  const text = `Estou há ${days} ${days === 1 ? "dia" : "dias"} sem fumar. Cada dia conta. 🚭`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Minha jornada sem fumar", text });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast("Conquista copiada para a área de transferência.");
    } else {
      showToast(text);
    }
  } catch {
    // O usuário pode cancelar o compartilhamento.
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


const THEME_KEY = "smokeFreeTheme";

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  localStorage.setItem(THEME_KEY, resolvedTheme);

  const button = $("#themeButton");
  if (button) {
    const isDark = resolvedTheme === "dark";
    button.textContent = isDark ? "☀" : "☾";
    button.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
    button.setAttribute("title", isDark ? "Tema claro" : "Tema escuro");
  }

  const meta = $("#themeColorMeta");
  if (meta) {
    meta.setAttribute("content", resolvedTheme === "dark" ? "#1f2933" : "#e9eef3");
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "dark" ? "dark" : "light");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  updateDashboard();
  setInterval(updateDashboard, 1000);

  $("#themeButton").addEventListener("click", toggleTheme);
  $("#openSettings").addEventListener("click", openSettings);
  $("#settingsForm").addEventListener("submit", handleSettingsSubmit);
  $("#closeSettings").addEventListener("click", () => $("#settingsModal").close());
  $("#cravingButton").addEventListener("click", openCravingModal);
  $("#closeCraving").addEventListener("click", closeCravingModal);

  $("#cravingModal").addEventListener("close", () => {
    if (breathingTimer) {
      clearInterval(breathingTimer);
      breathingTimer = null;
    }
  });

  $("#shareButton").addEventListener("click", shareProgress);

  document.querySelectorAll(".coping-card").forEach((button) => {
    button.addEventListener("click", () => {
      const messages = {
        water: "Pegue um copo de água e beba lentamente. Use este minuto para sair do piloto automático.",
        move: "Levante-se e mude de ambiente. Uma pequena mudança pode quebrar a associação com o cigarro.",
        delay: "Adie qualquer decisão por 10 minutos. Quando esse tempo passar, reavalie como você está se sentindo."
      };

      $("#cravingMessage").textContent =
        messages[button.dataset.tip] || "Continue. Este momento vai passar.";
    });
  });

  if (!localStorage.getItem(STORAGE_KEY)) {
    setTimeout(openSettings, 500);
  }
});
