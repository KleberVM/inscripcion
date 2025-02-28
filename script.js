document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const form = document.getElementById('registrationForm');
    const progressBar = document.getElementById('formProgress');
    const areasCheckboxes = document.querySelectorAll('input[name="areas"]');
    const roboticaCategoria = document.getElementById('roboticaCategoria');
    const fileInput = document.getElementById('comprobante');
    const filePreview = document.getElementById('file-preview');
    const removeFileBtn = document.getElementById('remove-file');
    const resetFormBtn = document.getElementById('resetForm');
    const successModal = document.getElementById('successModal');
    const totalPago = document.getElementById('totalPago');
    const departamentoSelect = document.getElementById('departamento');
    const provinciaSelect = document.getElementById('provincia');

    // Configuración
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const PRECIO_POR_AREA = 50; // 50 Bs. por área

    // Datos de provincias por departamento
    const provincias = {
        'LP': ['Murillo', 'Omasuyos', 'Pacajes', 'Camacho', 'Muñecas', 'Larecaja', 'Franz Tamayo'],
        'CB': ['Cercado', 'Campero', 'Ayopaya', 'Esteban Arze', 'Arani', 'Arque', 'Capinota'],
        'SC': ['Andrés Ibáñez', 'Warnes', 'Velasco', 'Ichilo', 'Chiquitos', 'Sara', 'Cordillera'],
        'OR': ['Cercado', 'Avaroa', 'Carangas', 'Sajama', 'Litoral', 'Poopó', 'Pantaleón Dalence'],
        'PT': ['Tomás Frías', 'Cornelio Saavedra', 'Chayanta', 'Charcas', 'Nor Chichas', 'Sur Chichas'],
        'TJ': ['Cercado', 'Avilés', 'Méndez', 'Arce', 'Gran Chaco', 'Burdet O','Connor'],
        'CH': ['Oropeza', 'Azurduy', 'Zudáñez', 'Tomina', 'Hernando Siles', 'Yamparáez'],
        'BE': ['Cercado', 'Vaca Díez', 'Gral. José Ballivián', 'Yacuma', 'Moxos', 'Marbán'],
        'PD': ['Nicolás Suárez', 'Manuripi', 'Madre de Dios', 'Abuná', 'Federico Román']
    };

    // Actualizar barra de progreso
    function updateProgress() {
        const requiredInputs = form.querySelectorAll('input[required], select[required]');
        const totalRequired = requiredInputs.length;
        let completed = 0;

        requiredInputs.forEach(input => {
            if (input.value) completed++;
        });

        const progress = (completed / totalRequired) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Validar selección de áreas
    function validateAreas() {
        let selectedCount = 0;
        areasCheckboxes.forEach(checkbox => {
            if (checkbox.checked) selectedCount++;
        });

        const errorDiv = document.querySelector('.areas-error');
        if (selectedCount > 2) {
            errorDiv.style.display = 'block';
            return false;
        }
        errorDiv.style.display = 'none';
        return true;
    }

    // Calcular total a pagar
    function updateTotal() {
        let selectedCount = 0;
        areasCheckboxes.forEach(checkbox => {
            if (checkbox.checked) selectedCount++;
        });
        totalPago.textContent = `${selectedCount * PRECIO_POR_AREA}.00 Bs.`;
    }

    // Mostrar/ocultar categoría de robótica
    function toggleRoboticaCategoria() {
        const roboticaCheckbox = document.getElementById('robotica');
        roboticaCategoria.style.display = roboticaCheckbox.checked ? 'block' : 'none';
        if (!roboticaCheckbox.checked) {
            document.getElementById('categoria').value = '';
        }
    }

    // Validar archivo
    function validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const errorElement = fileInput.nextElementSibling;

        if (!validTypes.includes(file.type)) {
            showError(fileInput, 'Formato de archivo no válido');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            showError(fileInput, 'El archivo excede el tamaño máximo de 2MB');
            return false;
        }

        return true;
    }

    // Actualizar la función handleFileSelect
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (validateFile(file)) {
            const fileName = document.querySelector('.selected-file-name');
            fileName.textContent = file.name;
            filePreview.classList.add('active');
            clearError(fileInput);

            // Eliminar vista previa anterior
            const existingPreview = filePreview.querySelector('.preview-content');
            if (existingPreview) {
                existingPreview.remove();
            }

            // Crear nuevo contenedor de vista previa
            const previewContent = document.createElement('div');
            previewContent.classList.add('preview-content');

            if (file.type.startsWith('image/')) {
                // Vista previa para imágenes
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.createElement('div');
                    previewContainer.classList.add('preview-container');

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('file-preview-image');
                    
                    const expandButton = document.createElement('button');
                    expandButton.type = 'button';
                    expandButton.classList.add('btn-expand');
                    expandButton.innerHTML = '<i class="fas fa-expand-alt"></i>';
                    expandButton.onclick = () => {
                        const modal = document.createElement('div');
                        modal.classList.add('preview-modal');
                        modal.innerHTML = `
                            <div class="preview-modal-content">
                                <img src="${e.target.result}" alt="Vista previa">
                                <button class="btn-close"><i class="fas fa-times"></i></button>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        
                        modal.querySelector('.btn-close').onclick = () => modal.remove();
                        modal.onclick = (e) => {
                            if (e.target === modal) modal.remove();
                        };
                    };

                    previewContainer.appendChild(img);
                    previewContainer.appendChild(expandButton);
                    previewContent.appendChild(previewContainer);
                    filePreview.insertBefore(previewContent, filePreview.firstChild);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                // Vista previa para PDFs
                const pdfContainer = document.createElement('div');
                pdfContainer.classList.add('pdf-preview-container');
                
                const pdfIcon = document.createElement('div');
                pdfIcon.classList.add('pdf-preview');
                pdfIcon.innerHTML = '<i class="fas fa-file-pdf"></i>';
                
                const pdfInfo = document.createElement('div');
                pdfInfo.classList.add('pdf-info');
                pdfInfo.innerHTML = `
                    <p class="pdf-name">${file.name}</p>
                    <p class="pdf-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                `;

                const buttonsContainer = document.createElement('div');
                buttonsContainer.classList.add('pdf-buttons');

                const viewButton = document.createElement('button');
                viewButton.type = 'button';
                viewButton.classList.add('btn-view-pdf');
                viewButton.innerHTML = '<i class="fas fa-eye"></i> Ver PDF';
                viewButton.onclick = () => {
                    const pdfUrl = URL.createObjectURL(file);
                    window.open(pdfUrl, '_blank');
                };

                buttonsContainer.appendChild(viewButton);
                pdfContainer.appendChild(pdfIcon);
                pdfContainer.appendChild(pdfInfo);
                pdfContainer.appendChild(buttonsContainer);
                previewContent.appendChild(pdfContainer);
                filePreview.insertBefore(previewContent, filePreview.firstChild);
            }
        } else {
            event.target.value = '';
            filePreview.classList.remove('active');
        }
    }

    // Mostrar errores
    function showError(element, message) {
        const errorSpan = element.parentElement.querySelector('.error-message');
        errorSpan.textContent = message;
        element.classList.add('error');
    }

    // Limpiar errores
    function clearError(element) {
        const errorSpan = element.parentElement.querySelector('.error-message');
        errorSpan.textContent = '';
        element.classList.remove('error');
    }

    // Función para cargar provincias
    function cargarProvincias(departamento) {
        provinciaSelect.innerHTML = '<option value="">Seleccione Provincia</option>';
        if (provincias[departamento]) {
            provincias[departamento].forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.toLowerCase().replace(/\s+/g, '_');
                option.textContent = provincia;
                provinciaSelect.appendChild(option);
            });
            provinciaSelect.disabled = false;
        } else {
            provinciaSelect.disabled = true;
        }
    }

    // Agregar tutor
    let tutorCount = 1;
    function agregarTutor() {
        tutorCount++;
        const tutorTemplate = `
            <div class="tutor-section" id="tutor_${tutorCount}">
                <div class="tutor-header">
                    <h3>Tutor ${tutorCount}</h3>
                    <button type="button" class="btn-remove-tutor" onclick="eliminarTutor(${tutorCount})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label for="tutor_nombre_${tutorCount}">Nombre del Tutor *</label>
                    <input type="text" id="tutor_nombre_${tutorCount}" name="tutor_nombre[]" required>
                </div>
                <div class="form-group">
                    <label for="tutor_email_${tutorCount}">Correo Electrónico del Tutor *</label>
                    <input type="email" id="tutor_email_${tutorCount}" name="tutor_email[]" required>
                </div>
                <div class="form-group">
                    <label for="tutor_telefono_${tutorCount}">Teléfono del Tutor *</label>
                    <input type="tel" id="tutor_telefono_${tutorCount}" name="tutor_telefono[]" required>
                </div>
            </div>
        `;
        document.getElementById('tutores-container').insertAdjacentHTML('beforeend', tutorTemplate);
    }

    // Función para eliminar tutor
    window.eliminarTutor = function(id) {
        const tutorSection = document.getElementById(`tutor_${id}`);
        if (tutorSection) {
            tutorSection.remove();
            updateProgress();
        }
    };

    // Event Listeners
    form.addEventListener('input', updateProgress);

    areasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!validateAreas()) {
                checkbox.checked = false;
            }
            updateTotal();
        });
    });

    document.getElementById('robotica').addEventListener('change', toggleRoboticaCategoria);

    fileInput.addEventListener('change', handleFileSelect);

    removeFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.remove('active');
    });

    // Drag and Drop para archivo
    const dropZone = document.querySelector('.file-upload-container');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        fileInput.files = dt.files;
        handleFileSelect({ target: fileInput });
    }

    departamentoSelect.addEventListener('change', (e) => {
        cargarProvincias(e.target.value);
        updateProgress();
    });

    document.getElementById('agregar_tutor').addEventListener('click', agregarTutor);

    // Reset form
    resetFormBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas borrar todo el formulario?')) {
            form.reset();
            filePreview.classList.remove('active');
            updateProgress();
            updateTotal();
            document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
            document.querySelectorAll('.error').forEach(element => element.classList.remove('error'));
        }
    });

    // Submit form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Aquí irían las validaciones finales y el envío al servidor
        
        // Simulación de envío exitoso
        successModal.style.display = 'flex';
        setTimeout(() => {
            successModal.style.display = 'none';
            form.reset();
            updateProgress();
            updateTotal();
        }, 3000);
    });

    // Inicialización
    updateProgress();
    updateTotal();
});