// API Configuration
        const API_BASE_URL = 'https://coqueta.fluxis.com.co/api';
        const API_ENDPOINTS = {
            professionals: `${API_BASE_URL}/profesionales`,
            services: `${API_BASE_URL}/servicios`,
            reservations: `${API_BASE_URL}/reservas`,
            timeSlots: (date) => `${API_BASE_URL}/reservas/${date}`
        };

        document.addEventListener('DOMContentLoaded', function () {
            // Mobile menu toggle
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');

            mobileMenuButton.addEventListener('click', function () {
                mobileMenu.classList.toggle('hidden');

                // Cambiar ícono cuando el menú está abierto
                const isOpen = !mobileMenu.classList.contains('hidden');
                this.innerHTML = isOpen
                    ? '<svg class="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                    : '<svg class="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
            });

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();

                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // Close mobile menu if open
                        mobileMenu.classList.add('hidden');
                        mobileMenuButton.innerHTML = '<svg class="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';

                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // Global variables
            let professionals = [];
            let services = [];
            let timeSlots = [];
            let selectedProfessional = null;
            let selectedService = null;
            let selectedDateTime = null;

            // DOM elements
            const nextToStep2 = document.getElementById('nextToStep2');
            const nextToStep3 = document.getElementById('nextToStep3');
            const nextToStep4 = document.getElementById('nextToStep4');
            const backToStep1 = document.getElementById('backToStep1');
            const backToStep2 = document.getElementById('backToStep2');
            const backToStep3 = document.getElementById('backToStep3');
            const reservationForm = document.getElementById('reservationForm');
            const progressBar = document.getElementById('progress-bar');
            const reservationDate = document.getElementById('reservationDate');

            // Modal elements
            const confirmationModal = document.getElementById('confirmationModal');
            const errorModal = document.getElementById('errorModal');
            const closeConfirmationModal = document.getElementById('closeConfirmationModal');
            const confirmCloseModal = document.getElementById('confirmCloseModal');
            const closeErrorModal = document.getElementById('closeErrorModal');
            const errorCloseModal = document.getElementById('errorCloseModal');
            const loadingSpinner = document.getElementById('loadingSpinner');

            // Modal event listeners
            [closeConfirmationModal, confirmCloseModal].forEach(btn => {
                btn.addEventListener('click', function () {
                    confirmationModal.classList.add('hidden');
                });
            });

            [closeErrorModal, errorCloseModal].forEach(btn => {
                btn.addEventListener('click', function () {
                    errorModal.classList.add('hidden');
                });
            });

            // Load initial data
            loadInitialData();

            // Load all initial data
            function loadInitialData() {
                // Load professionals
                fetchData(API_ENDPOINTS.professionals)
                    .then(data => {
                        professionals = Array.isArray(data) ? data : [];
                        renderProfessionalsForReservation(); // Eliminada la llamada a renderProfessionals()
                    })
                    .catch(error => {
                        console.error('Error loading professionals:', error);
                        document.getElementById('professionalsContainer').innerHTML = `
                            <div class="col-span-full text-center text-red-500">
                                <i class="fas fa-exclamation-triangle mr-2"></i> Error cargando profesionales
                            </div>
                        `;
                    });

                // Load services
                fetchData(API_ENDPOINTS.services)
                    .then(data => {
                        services = data;
                        renderServices();
                        renderServicesForReservation();
                    })
                    .catch(error => {
                        console.error('Error loading services:', error);
                        document.getElementById('services-container').innerHTML = `
                            <div class="col-span-full text-center text-red-500">
                                <i class="fas fa-exclamation-triangle mr-2"></i> Error cargando servicios
                            </div>
                        `;
                        document.getElementById('servicesReservationContainer').innerHTML = `
                            <div class="col-span-full text-center text-red-500">
                                <i class="fas fa-exclamation-triangle mr-2"></i> Error cargando servicios
                            </div>
                        `;
                    });
            }

            // Generic fetch function
            async function fetchData(url) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error fetching data:', error);
                    throw error;
                }
            }

            // Render professionals in reservation section
            function renderProfessionalsForReservation() {
                const container = document.getElementById('professionalsContainer');

                if (!professionals || !professionals.length) {
                    container.innerHTML = `
            <div class="col-span-full text-center text-gray-500">
                No hay profesionales disponibles
            </div>
        `;
                    return;
                }

                container.innerHTML = professionals.map(prof => {
                    // Usar los campos de la nueva estructura de datos
                    const profName = `${prof.nombres || ''} ${prof.apellidos || ''}`.trim() || `Profesional ${prof.id}`;
                    const profSpecialty = 'Manicurista profesional'; // Valor por defecto ya que no viene en la API
                    const profId = prof.id;
                    const profDocument = prof.documento || '';

                    return `
        <div class="professional-card cursor-pointer transition duration-300 hover:shadow-lg border-2 border-transparent rounded-xl p-6" data-id="${profId}">
            <div class="flex items-center">
                <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                    <img src="https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 100)}.jpg" alt="${profName}" class="w-full h-full object-cover">
                </div>
                <div class="ml-4">
                    <h5 class="font-semibold text-lg">${profName}</h5>
                    <p class="text-gray-500">${profSpecialty}</p>
                    ${profDocument ? `<p class="text-gray-400 text-sm">Doc: ${profDocument}</p>` : ''}
                </div>
            </div>
        </div>
        `;
                }).join('');

                // Add event listeners to professional cards
                document.querySelectorAll('.professional-card').forEach(card => {
                    card.addEventListener('click', function () {
                        // Remove previous selection
                        document.querySelectorAll('.professional-card').forEach(c => {
                            c.classList.remove('border-primary', 'bg-light');
                        });

                        // Add selection to current
                        this.classList.add('border-primary', 'bg-light');
                        selectedProfessional = this.getAttribute('data-id');
                        document.getElementById('selectedProfessional').value = selectedProfessional;
                        nextToStep2.disabled = false;

                        // Update progress
                        updateProgress(1);
                    });
                });
            }

            // Render services in main section
            function renderServices() {
                const container = document.getElementById('services-container');

                if (!services.length) {
                    container.innerHTML = `
                        <div class="col-span-full text-center text-gray-500">
                            No hay servicios disponibles
                        </div>
                    `;
                    return;
                }

                container.innerHTML = services.map(service => `
                    <div class="service-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 h-full animate-fade-in">
                        <div class="p-6 text-center">
                            <div class="service-icon bg-primary bg-opacity-10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl transition duration-300">
                                <i class="fas fa-${getServiceIcon(service.nombre)}"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-3">${service.nombre}</h3>
                            <p class="text-gray-600 mb-4">${service.descripcion || 'Servicio profesional de alta calidad'}</p>
                            <div class="text-primary font-bold text-lg mb-4">$${service.precio?.toLocaleString() || '0'}</div>
                            <button class="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-full transition transform hover:scale-105" onclick="scrollToReservation()">
                                <i class="fas fa-calendar-plus mr-2"></i> Reservar
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            // Get appropriate icon for service
            function getServiceIcon(serviceName) {
                const lowerName = serviceName.toLowerCase();
                if (lowerName.includes('manicure')) return 'hand-sparkles';
                if (lowerName.includes('acrílic') || lowerName.includes('extension')) return 'gem';
                if (lowerName.includes('diseño') || lowerName.includes('artístic')) return 'paint-brush';
                if (lowerName.includes('tratamiento')) return 'spa';
                if (lowerName.includes('premium') || lowerName.includes('complet')) return 'crown';
                return 'hand-holding-heart';
            }

            // Render services in reservation section
            function renderServicesForReservation() {
                const container = document.getElementById('servicesReservationContainer');

                if (!services.length) {
                    container.innerHTML = `
                        <div class="col-span-full text-center text-gray-500">
                            No hay servicios disponibles
                        </div>
                    `;
                    return;
                }

                container.innerHTML = services.map(service => `
                    <div class="service-card-reservation cursor-pointer transition duration-300 hover:shadow-lg border-2 border-transparent rounded-xl p-6" data-id="${service.id}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h5 class="font-semibold text-lg">${service.nombre}</h5>
                                <p class="text-gray-600 mb-2">${service.descripcion || 'Servicio profesional'}</p>
                            </div>
                            <div class="font-bold text-primary">$${service.precio?.toLocaleString() || '0'}</div>
                        </div>
                    </div>
                `).join('');

                // Add event listeners to service cards
                document.querySelectorAll('.service-card-reservation').forEach(card => {
                    card.addEventListener('click', function () {
                        // Remove previous selection
                        document.querySelectorAll('.service-card-reservation').forEach(c => {
                            c.classList.remove('border-primary', 'bg-light');
                        });

                        // Add selection to current
                        this.classList.add('border-primary', 'bg-light');
                        selectedService = this.getAttribute('data-id');
                        document.getElementById('selectedService').value = selectedService;
                        nextToStep3.disabled = false;

                        // Update progress
                        updateProgress(2);
                    });
                });
            }

            // Load time slots when date is selected
            reservationDate.addEventListener('change', function () {
                const date = this.value;
                if (!date) return;

                const timeSlotsContainer = document.getElementById('timeSlotsContainer');
                timeSlotsContainer.innerHTML = `
                    <div class="text-center">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        <p class="mt-2 text-gray-500">Cargando horarios disponibles...</p>
                    </div>
                `;

                fetchData(API_ENDPOINTS.timeSlots(date))
                    .then(data => {
                        timeSlots = data;
                        renderTimeSlots();
                    })
                    .catch(error => {
                        console.error('Error loading time slots:', error);
                        timeSlotsContainer.innerHTML = `
                            <div class="col-span-full text-center text-red-500">
                                <i class="fas fa-exclamation-triangle mr-2"></i> Error cargando horarios
                            </div>
                        `;
                    });
            });

            // Render available time slots
            function renderTimeSlots() {
                const container = document.getElementById('timeSlotsContainer');

                if (!timeSlots.length) {
                    container.innerHTML = `
                        <div class="col-span-full text-center text-gray-500">
                            No hay horarios disponibles para esta fecha
                        </div>
                    `;
                    return;
                }

                // Group time slots by hour
                const groupedSlots = {};

                timeSlots.forEach(slot => {
                    const time = slot.fecha.split(' ')[1];
                    const hour = time.substring(0, 5); // Format HH:MM

                    if (!groupedSlots[hour]) {
                        groupedSlots[hour] = {
                            available: slot.clienteId === null,
                            fullDateTime: slot.fecha,
                            id: slot.id
                        };
                    }
                });

                container.innerHTML = `
                    <label class="block text-gray-700 font-medium mb-3">Horarios Disponibles</label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" id="timeSlotsGrid">
                        ${Object.entries(groupedSlots).map(([time, slot]) => `
                            <div class="time-slot text-center px-4 py-3 rounded-lg border cursor-pointer transition ${slot.available ? 'bg-green-100 border-green-300 hover:bg-green-200' : 'bg-red-100 border-red-300 text-red-700 line-through cursor-not-allowed'}" 
                                 data-datetime="${slot.fullDateTime}" 
                                 data-id="${slot.id || ''}">
                                ${time}
                            </div>
                        `).join('')}
                    </div>
                `;

                // Add event listeners to time slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    if (slot.classList.contains('bg-green-100')) {
                        slot.addEventListener('click', function () {
                            // Remove previous selection
                            document.querySelectorAll('.time-slot').forEach(t => {
                                t.classList.remove('bg-primary', 'text-white', 'border-primary');
                            });

                            // Add selection to current
                            this.classList.add('bg-primary', 'text-white', 'border-primary');
                            selectedDateTime = this.dataset.datetime;
                            document.getElementById('selectedDateTime').value = selectedDateTime;
                            document.getElementById('reservationId').value = this.dataset.id;
                            nextToStep4.disabled = false;

                            // Update progress
                            updateProgress(3);
                        });
                    }
                });
            }

            // Navigation between steps
            nextToStep2.addEventListener('click', function () {
                if (!selectedProfessional) return;

                document.getElementById('step1').classList.add('hidden');
                document.getElementById('step2').classList.remove('hidden');
                document.getElementById('step2').classList.add('animate-fade-in');
            });

            nextToStep3.addEventListener('click', function () {
                if (!selectedService) return;

                document.getElementById('step2').classList.add('hidden');
                document.getElementById('step3').classList.remove('hidden');
                document.getElementById('step3').classList.add('animate-fade-in');

                // Set minimum date to today
                const today = new Date().toISOString().split('T')[0];
                reservationDate.min = today;
            });

            nextToStep4.addEventListener('click', function () {
                if (!selectedDateTime) return;

                document.getElementById('step3').classList.add('hidden');
                document.getElementById('step4').classList.remove('hidden');
                document.getElementById('step4').classList.add('animate-fade-in');

                // Update progress
                updateProgress(4);
            });

            backToStep1.addEventListener('click', function () {
                document.getElementById('step2').classList.add('hidden');
                document.getElementById('step1').classList.remove('hidden');
                document.getElementById('step1').classList.add('animate-fade-in');

                // Update progress
                updateProgress(1);
            });

            backToStep2.addEventListener('click', function () {
                document.getElementById('step3').classList.add('hidden');
                document.getElementById('step2').classList.remove('hidden');
                document.getElementById('step2').classList.add('animate-fade-in');

                // Update progress
                updateProgress(2);
            });

            backToStep3.addEventListener('click', function () {
                document.getElementById('step4').classList.add('hidden');
                document.getElementById('step3').classList.remove('hidden');
                document.getElementById('step3').classList.add('animate-fade-in');

                // Update progress
                updateProgress(3);
            });

            // Update progress bar and step indicators
            function updateProgress(currentStep) {
                // Update progress bar
                const progressPercentage = (currentStep - 1) * 33.33;
                progressBar.style.width = `${progressPercentage}%`;

                // Update step indicators
                document.querySelectorAll('.step').forEach((step, index) => {
                    const number = step.querySelector('.step-number');
                    const label = step.querySelector('.step-label');

                    if (index < currentStep - 1) {
                        // Completed steps
                        number.classList.remove('bg-gray-200', 'text-gray-500');
                        number.classList.add('bg-green-500', 'text-white');
                        label.classList.remove('text-gray-500');
                        label.classList.add('text-green-500');
                    } else if (index === currentStep - 1) {
                        // Current step
                        number.classList.remove('bg-gray-200', 'text-gray-500');
                        number.classList.add('bg-primary', 'text-white');
                        label.classList.remove('text-gray-500');
                        label.classList.add('text-primary', 'font-medium');
                    } else {
                        // Future steps
                        number.classList.remove('bg-primary', 'text-white', 'bg-green-500');
                        number.classList.add('bg-gray-200', 'text-gray-500');
                        label.classList.remove('text-primary', 'text-green-500', 'font-medium');
                        label.classList.add('text-gray-500');
                    }
                });
            }

            // Form submission
            reservationForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const clientName = document.getElementById('clientName').value;
                const clientEmail = document.getElementById('clientEmail').value;
                const clientPhone = document.getElementById('clientPhone').value;
                const clientId = document.getElementById('clientId').value;

                if (!clientName || !clientEmail || !clientPhone) {
                    showError('Por favor completa todos los campos obligatorios del cliente.');
                    return;
                }

                // Show loading spinner
                loadingSpinner.classList.remove('hidden');

                // Prepare reservation data
                const reservationData = {
                    id: document.getElementById('reservationId').value || null,
                    fecha: selectedDateTime,
                    clienteId: clientId || null,
                    servicioId: selectedService,
                    profesionalId: selectedProfessional,
                    clienteNombre: clientName,
                    clienteEmail: clientEmail,
                    clienteTelefono: clientPhone
                };

                // Send reservation to API
                fetch(API_ENDPOINTS.reservations, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reservationData)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la respuesta del servidor');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Hide loading spinner
                        loadingSpinner.classList.add('hidden');

                        // Show confirmation with details
                        showConfirmation(data);

                        // Reset form
                        resetReservationForm();
                    })
                    .catch(error => {
                        console.error('Error submitting reservation:', error);
                        loadingSpinner.classList.add('hidden');
                        showError('Error al procesar la reserva. Por favor intenta nuevamente.');
                    });
            });

            // Show confirmation modal with reservation details
            function showConfirmation(reservationData) {
                const confirmationDetails = document.getElementById('confirmationDetails');

                // Get form values directly from the form inputs
                const clientName = document.getElementById('clientName').value;
                const clientEmail = document.getElementById('clientEmail').value;
                const clientPhone = document.getElementById('clientPhone').value;
                const clientId = document.getElementById('clientId').value;

                // Format date for display
                const dateTime = new Date(selectedDateTime);
                const formattedDate = dateTime.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Find professional and service details from our local variables
                const professional = professionals.find(p => p.id == selectedProfessional) || {};
                const service = services.find(s => s.id == selectedService) || {};

                confirmationDetails.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center">
                <i class="fas fa-user-tie text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Profesional:</p>
                    <p>${professional.nombre || professional.name || 'Profesional seleccionado'}</p>
                </div>
            </div>
            <div class="flex items-center">
                <i class="fas fa-hand-sparkles text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Servicio:</p>
                    <p>${service.nombre || service.name || 'Servicio seleccionado'}</p>
                    ${service.precio ? `<p class="text-primary font-medium">$${service.precio.toLocaleString()}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center">
                <i class="fas fa-calendar-day text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Fecha y hora:</p>
                    <p>${formattedDate}</p>
                </div>
            </div>
            ${clientId ? `
            <div class="flex items-center">
                <i class="fas fa-id-card text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">ID de Cliente:</p>
                    <p>${clientId}</p>
                </div>
            </div>
            ` : ''}
            <div class="flex items-center">
                <i class="fas fa-user text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Nombre:</p>
                    <p>${clientName}</p>
                </div>
            </div>
            <div class="flex items-center">
                <i class="fas fa-envelope text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Email:</p>
                    <p>${clientEmail}</p>
                </div>
            </div>
            <div class="flex items-center">
                <i class="fas fa-phone-alt text-primary mr-3"></i>
                <div>
                    <p class="text-gray-700 font-medium">Teléfono:</p>
                    <p>${clientPhone}</p>
                </div>
            </div>
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mt-4">
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>¡Tu reserva ha sido confirmada con éxito! Te esperamos en nuestro centro.</span>
                </div>
            </div>
        </div>`;

                confirmationModal.classList.remove('hidden');
            }

            // Show error modal
            function showError(message) {
                document.getElementById('errorMessage').textContent = message;
                errorModal.classList.remove('hidden');
            }

            // Reset reservation form
            function resetReservationForm() {
                // Reset selections
                selectedProfessional = null;
                selectedService = null;
                selectedDateTime = null;

                // Reset UI
                document.querySelectorAll('.professional-card, .service-card-reservation, .time-slot').forEach(el => {
                    el.classList.remove('border-primary', 'bg-light', 'bg-primary', 'text-white');
                });

                // Reset form fields
                document.getElementById('reservationForm').reset();
                document.getElementById('reservationId').value = '';
                document.getElementById('timeSlotsContainer').innerHTML = `
                    <p class="text-gray-500">Por favor selecciona una fecha para ver los horarios disponibles</p>
                `;

                // Reset steps
                document.getElementById('step4').classList.add('hidden');
                document.getElementById('step1').classList.remove('hidden');
                document.getElementById('step1').classList.add('animate-fade-in');

                // Reset buttons
                nextToStep2.disabled = true;
                nextToStep3.disabled = true;
                nextToStep4.disabled = true;

                // Reset progress
                updateProgress(1);
            }
        });

        // Scroll to reservation function (global)
        function scrollToReservation() {
            document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });
        }