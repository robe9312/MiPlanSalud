document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('healthForm');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close');
    const planPreview = document.getElementById('planPreview');
    const waLink = document.getElementById('waLink');

    closeBtn.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => {
        if (e.target == modal) modal.classList.remove('show');
    };

    const comidas = {
        "Normal": ["Avena+Huevos", "Pollo+Arroz", "Salmón+Ensalada", "Yogur+Nueces"],
        "Vegetariana": ["Smoothie Tofu", "Lentejas+Quinua", "Ensalada Garbanzos", "Tostada Aguacate"],
        "Baja Carb": ["Tortilla Espinaca", "Pollo+Aguacate", "Ternera+Zanahoria", "Queso+Nueces"]
    };

    const ejercicios = [
        "Cardio ligero 15m",
        "Flexiones 3x10",
        "Plancha 30s x3",
        "Sentadillas 4x15",
        "Yoga flex 10m",
        "Trote suave 20m",
        "Estiramiento full"
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const sexo = document.getElementById('sexo').value;
        const edad = parseInt(document.getElementById('edad').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const altura = parseFloat(document.getElementById('altura').value);
        const actividad = parseFloat(document.getElementById('actividad').value);
        const objetivo = parseInt(document.getElementById('objetivo').value);
        const dieta = document.getElementById('dieta').value;
        const telefono = document.getElementById('telefono').value;

        // Limpiar teléfono
        const cleanPhone = telefono.replace(/[^\d+]/g, '');
        if (cleanPhone.length < 8) {
            alert("Introduce un teléfono válido");
            return;
        }

        // Cálculos
        const alturaM = altura / 100;
        const bmi = peso / (alturaM * alturaM);
        
        let categoria = "Normal";
        if (bmi < 18.5) categoria = "Bajo peso";
        else if (bmi >= 25 && bmi < 29.9) categoria = "Sobrepeso";
        else if (bmi >= 30) categoria = "Obesidad";

        let bmr = 0;
        if (sexo === "H") {
            bmr = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
        } else {
            bmr = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
        }

        const tdee = bmr * actividad;
        const calorias = Math.max(1200, Math.round(tdee + objetivo));

        // Generar 7 días
        let planDiario = "";
        const c = comidas[dieta];
        for(let i=0; i<7; i++) {
            planDiario += `D${i+1}: ${c[i%c.length]} | ${ejercicios[i%ejercicios.length]}\n`;
        }

        const mensaje = `¡Tu Plan de Salud Personalizado! 👇

📊 BMI: ${bmi.toFixed(1)} (${categoria})
🔥 Calorías: ${calorias} kcal

📅 PLAN 7 DÍAS:
${planDiario.trim()}

💧 2.5L agua | 🛌 8h
🛒 Suplemento top: amzn.to/proteina-vip

#PlanSaludGratis`;

        // Mostrar Modal AI Processing
        modal.classList.add('show');
        document.getElementById('aiProcessing').style.display = 'block';
        document.getElementById('aiReady').style.display = 'none';
        document.getElementById('aiStatusText').innerText = "Analizando perfil de salud...";

        setTimeout(() => document.getElementById('aiStatusText').innerText = "Calculando BMI y TDEE...", 800);
        setTimeout(() => document.getElementById('aiStatusText').innerText = "Diseñando menú personalizado...", 1600);
        setTimeout(() => {
            document.getElementById('aiProcessing').style.display = 'none';
            document.getElementById('aiReady').style.display = 'block';

            // Set link
            const urlWa = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(mensaje)}`;
            waLink.href = urlWa;
        }, 2700);
    });
});
