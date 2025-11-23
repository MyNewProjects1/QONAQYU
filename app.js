// In-memory data storage
window._users = null;
window._rooms = null;
window._bookings = null;
window._session = null;
window._settings = null;
import { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from './firebase-config.js';


// Main application object
var app = {
    currentUser: null,
    selectedRole: 'client',
    currentTab: 'clientRooms',
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.checkSession();
    },

    loadData: function() {
        if (!this.getData('users')) {
            var users = [
                {
                    id: '1',
                    username: 'client1',
                    password: '123456',
                    role: 'client',
                    email: 'client@example.com',
                    name: 'Иван Клиент',
                    phone: '+7 700 123 45 67'
                },
                {
                    id: '2',
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    email: 'admin@hotel.com',
                    name: 'Әкімші',
                    phone: '+7 700 000 00 00'
                }
            ];
            this.setData('users', users);
        }

        if (!this.getData('rooms')) {
            var rooms = [
                {
                    id: '1',
                    name: '101',
                    type: 'Стандарт',
                    capacity: 2,
                    price: 15000,
                    description: 'Жайлы бөлме стандартты жайлылықтармен',
                    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200',
                    available: true
                },
                {
                    id: '2',
                    name: '201',
                    type: 'Люкс',
                    capacity: 4,
                    price: 35000,
                    description: 'Премиум бөлме қонақ бөлмесімен және террасамен',
                    image: 'https://images.unsplash.com/photo-1598928506372-7281e939e734?w=300&h=200',
                    available: true
                },
                {
                    id: '3',
                    name: '301',
                    type: 'Апартамент',
                    capacity: 6,
                    price: 55000,
                    description: 'Люкс апартамент толық аспазханамен',
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200',
                    available: false
                }
            ];
            this.setData('rooms', rooms);
        }

        if (!this.getData('bookings')) {
            var bookings = [
                {
                    id: '1001',
                    userId: '1',
                    roomId: '1',
                    roomName: '101',
                    clientName: 'Иван Клиент',
                    checkIn: '2024-12-20',
                    checkOut: '2024-12-25',
                    guests: 2,
                    totalPrice: 75000,
                    status: 'Расталған',
                    date: '2024-11-23',
                    notes: ''
                }
            ];
            this.setData('bookings', bookings);
        }

        if (!this.getData('settings')) {
            var settings = {
                hotelName: 'Менің Қонақүйім',
                hotelAddress: 'Пушкин көшесі, 123, Ақтөбе',
                hotelPhone: '+7 700 000 00 00',
                hotelEmail: 'info@hotel.kz',
                currency: '₸'
            };
            this.setData('settings', settings);
        }
    },

    setupEventListeners: function() {
        var self = this;
        document.querySelectorAll('.role-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                document.querySelectorAll('.role-btn').forEach(function(b) { b.classList.remove('active'); });
                e.currentTarget.classList.add('active');
                self.selectedRole = e.currentTarget.dataset.role;
            });
        });

        document.querySelectorAll('.nav-tab').forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                var tabName = e.currentTarget.dataset.tab;
                self.switchTab(tabName);
            });
        });

        document.getElementById('loginPassword').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') self.login();
        });
    },

    checkSession: function() {
        var session = this.getData('session');
        if (session && session.userId) {
            var users = this.getData('users');
            var user = users.find(function(u) { return u.id === session.userId; });
            if (user) {
                this.currentUser = user;
                this.showApp(user.role);
                return;
            }
        }
    },

    login: function() {
        var username = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            alert('Барлық өрістерді толтырыңыз!');
            return;
        }

        var self = this;
        var users = this.getData('users');
        var user = users.find(function(u) { return u.username === username && u.password === password && u.role === self.selectedRole; });

        if (user) {
            this.currentUser = user;
            this.setData('session', { userId: user.id });
            this.showApp(user.role);
        } else {
            alert('Қате пайдаланушы аты немесе құпия сөз!');
        }
    },

    register: function() {
        var name = document.getElementById('regName').value.trim();
        var username = document.getElementById('regUsername').value.trim();
        var email = document.getElementById('regEmail').value.trim();
        var phone = document.getElementById('regPhone').value.trim();
        var password = document.getElementById('regPassword').value;

        if (!name || !username || !email || !phone || !password) {
            alert('Барлық өрістерді толтырыңыз!');
            return;
        }

        var users = this.getData('users');
        if (users.find(function(u) { return u.username === username; })) {
            alert('Бұл пайдаланушы аты бос емес!');
            return;
        }

        var newUser = {
            id: Date.now().toString(),
            username: username,
            password: password,
            role: 'client',
            email: email,
            name: name,
            phone: phone
        };

        users.push(newUser);
        this.setData('users', users);
        alert('Тіркелу сәтті өтті! Енді кіре аласыз.');
        this.showLogin();
    },

    logout: function() {
        this.currentUser = null;
        this.setData('session', null);
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('clientApp').classList.remove('active');
        document.getElementById('adminApp').classList.remove('active');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    },

    showLogin: function() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    },

    showRegister: function() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    },

    showApp: function(role) {
        document.getElementById('loginScreen').style.display = 'none';
        
        if (role === 'client') {
            document.getElementById('clientApp').classList.add('active');
            document.getElementById('clientName').textContent = this.currentUser.name;
            document.getElementById('clientAvatar').textContent = this.currentUser.name.charAt(0);
            this.renderClientRooms();
            this.switchTab('clientRooms');
        } else {
            document.getElementById('adminApp').classList.add('active');
            this.renderAdminDashboard();
            this.switchTab('adminDashboard');
        }
    },

    switchTab: function(tabName) {
        var appId = this.currentUser.role === 'client' ? 'clientApp' : 'adminApp';
        var navTabs = document.querySelector('#' + appId + ' .nav-tabs');
        navTabs.querySelectorAll('.nav-tab').forEach(function(tab) {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        var content = document.querySelector('#' + appId + ' .content');
        content.querySelectorAll('.tab-content').forEach(function(tabContent) {
            if (tabContent.id === tabName) {
                tabContent.classList.add('active');
            } else {
                tabContent.classList.remove('active');
            }
        });

        switch(tabName) {
            case 'clientRooms':
                this.renderClientRooms();
                break;
            case 'clientBookings':
                this.renderClientBookings();
                break;
            case 'clientProfile':
                this.renderClientProfile();
                break;
            case 'adminDashboard':
                this.renderAdminDashboard();
                break;
            case 'adminRooms':
                this.renderAdminRooms();
                break;
            case 'adminBookings':
                this.renderAdminBookings();
                break;
            case 'adminClients':
                this.renderAdminClients();
                break;
            case 'adminReports':
                this.renderAdminReports();
                break;
            case 'adminSettings':
                this.renderAdminSettings();
                break;
        }
    },

    renderClientRooms: function() {
        var rooms = this.getData('rooms');
        var container = document.getElementById('roomsContainer');
        
        if (rooms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-bed"></i><h3>Бөлмелер жоқ</h3></div>';
            return;
        }

        container.innerHTML = rooms.map(function(room) {
            return '<div class="room-card"><img src="' + room.image + '" alt="' + room.name + '" onerror="this.src=\'https://via.placeholder.com/300x200?text=Бөлме\'">' +
                '<div class="room-card-body"><div class="d-flex justify-between align-center mb-2"><h3>Бөлме ' + room.name + '</h3>' +
                '<span class="badge ' + (room.available ? 'badge-success' : 'badge-danger') + '">' + (room.available ? 'Бос' : 'Толық') + '</span></div>' +
                '<p style="color: var(--gray); font-size: 14px;">' + room.description + '</p>' +
                '<div class="room-info"><div class="room-info-item"><i class="fas fa-users"></i><span>' + room.capacity + ' адам</span></div>' +
                '<div class="room-info-item"><i class="fas fa-tag"></i><span>' + room.type + '</span></div></div>' +
                '<div class="room-price">' + room.price.toLocaleString() + ' ₸ <small style="font-size: 14px; color: var(--gray);">/түн</small></div>' +
                (room.available ? '<button class="btn btn-primary" style="width: 100%;" onclick="app.showBookingModal(\'' + room.id + '\')"><i class="fas fa-calendar-check"></i> Брондау</button>' :
                '<button class="btn btn-secondary" style="width: 100%;" disabled><i class="fas fa-ban"></i> Қол жетімді емес</button>') +
                '</div></div>';
        }).join('');
    },

    filterRooms: function() {
        var type = document.getElementById('filterType').value;
        var capacity = document.getElementById('filterCapacity').value;
        var maxPrice = document.getElementById('filterPrice').value;

        var rooms = this.getData('rooms');

        if (type) {
            rooms = rooms.filter(function(r) { return r.type === type; });
        }
        if (capacity) {
            var cap = parseInt(capacity);
            rooms = rooms.filter(function(r) { return r.capacity >= cap; });
        }
        if (maxPrice) {
            var price = parseInt(maxPrice);
            rooms = rooms.filter(function(r) { return r.price <= price; });
        }

        var container = document.getElementById('roomsContainer');
        if (rooms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>Іздеу нәтижесі жоқ</h3></div>';
            return;
        }

        container.innerHTML = rooms.map(function(room) {
            return '<div class="room-card"><img src="' + room.image + '" alt="' + room.name + '" onerror="this.src=\'https://via.placeholder.com/300x200?text=Бөлме\'">' +
                '<div class="room-card-body"><div class="d-flex justify-between align-center mb-2"><h3>Бөлме ' + room.name + '</h3>' +
                '<span class="badge ' + (room.available ? 'badge-success' : 'badge-danger') + '">' + (room.available ? 'Бос' : 'Толық') + '</span></div>' +
                '<p style="color: var(--gray); font-size: 14px;">' + room.description + '</p>' +
                '<div class="room-info"><div class="room-info-item"><i class="fas fa-users"></i><span>' + room.capacity + ' адам</span></div>' +
                '<div class="room-info-item"><i class="fas fa-tag"></i><span>' + room.type + '</span></div></div>' +
                '<div class="room-price">' + room.price.toLocaleString() + ' ₸ <small style="font-size: 14px; color: var(--gray);">/түн</small></div>' +
                (room.available ? '<button class="btn btn-primary" style="width: 100%;" onclick="app.showBookingModal(\'' + room.id + '\')"><i class="fas fa-calendar-check"></i> Брондау</button>' :
                '<button class="btn btn-secondary" style="width: 100%;" disabled><i class="fas fa-ban"></i> Қол жетімді емес</button>') +
                '</div></div>';
        }).join('');
    },

    renderClientBookings: function() {
        var self = this;
        var bookings = this.getData('bookings').filter(function(b) { return b.userId === self.currentUser.id; });
        var container = document.getElementById('clientBookingsContainer');

        if (bookings.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><h3>Брондаулар жоқ</h3><p>Сіз әлі брондау жасаған жоқсыз</p></div>';
            return;
        }

        container.innerHTML = '<div class="table-container"><table><thead><tr><th>№</th><th>Бөлме</th><th>Кіру</th><th>Шығу</th><th>Қонақтар</th><th>Сома</th><th>Статус</th><th>Әрекет</th></tr></thead><tbody>' +
            bookings.map(function(booking) {
                return '<tr><td>#' + booking.id + '</td><td>Бөлме ' + booking.roomName + '</td>' +
                    '<td>' + self.formatDate(booking.checkIn) + '</td><td>' + self.formatDate(booking.checkOut) + '</td>' +
                    '<td>' + booking.guests + '</td><td>' + booking.totalPrice.toLocaleString() + ' ₸</td>' +
                    '<td><span class="badge ' + self.getStatusBadge(booking.status) + '">' + booking.status + '</span></td>' +
                    '<td>' + (booking.status === 'Күту' || booking.status === 'Расталған' ? 
                        '<button class="btn btn-danger btn-sm" onclick="app.cancelBooking(\'' + booking.id + '\')"><i class="fas fa-times"></i> Болдырмау</button>' : '-') +
                    '</td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderClientProfile: function() {
        var container = document.getElementById('profileContainer');
        container.innerHTML = '<div style="max-width: 600px;"><div class="form-group"><label>Толық аты</label>' +
            '<input type="text" class="form-control" value="' + this.currentUser.name + '" id="profileName"></div>' +
            '<div class="form-group"><label>Email</label><input type="email" class="form-control" value="' + this.currentUser.email + '" id="profileEmail"></div>' +
            '<div class="form-group"><label>Телефон</label><input type="tel" class="form-control" value="' + this.currentUser.phone + '" id="profilePhone"></div>' +
            '<div class="form-group"><label>Жаңа құпия сөз (бос қалдырсаңыз өзгермейді)</label>' +
            '<input type="password" class="form-control" id="profilePassword" placeholder="Жаңа құпия сөз"></div>' +
            '<button class="btn btn-primary" onclick="app.updateProfile()"><i class="fas fa-save"></i> Сақтау</button></div>';
    },

    updateProfile: function() {
        var name = document.getElementById('profileName').value.trim();
        var email = document.getElementById('profileEmail').value.trim();
        var phone = document.getElementById('profilePhone').value.trim();
        var password = document.getElementById('profilePassword').value;

        if (!name || !email || !phone) {
            alert('Барлық өрістерді толтырыңыз!');
            return;
        }

        var users = this.getData('users');
        var self = this;
        var userIndex = users.findIndex(function(u) { return u.id === self.currentUser.id; });
        
        users[userIndex].name = name;
        users[userIndex].email = email;
        users[userIndex].phone = phone;
        if (password) {
            users[userIndex].password = password;
        }

        this.setData('users', users);
        this.currentUser = users[userIndex];
        document.getElementById('clientName').textContent = name;
        alert('Профиль жаңартылды!');
    },

    renderAdminDashboard: function() {
        var bookings = this.getData('bookings');
        var rooms = this.getData('rooms');
        var users = this.getData('users').filter(function(u) { return u.role === 'client'; });

        var totalBookings = bookings.length;
        var activeBookings = bookings.filter(function(b) { return b.status === 'Расталған'; }).length;
        var totalRevenue = bookings.filter(function(b) { return b.status === 'Расталған'; }).reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
        var availableRooms = rooms.filter(function(r) { return r.available; }).length;

        var statsContainer = document.getElementById('statsContainer');
        statsContainer.innerHTML = '<div class="stat-card"><i class="fas fa-calendar-check"></i><h3>' + totalBookings + '</h3><p>Барлық брондаулар</p></div>' +
            '<div class="stat-card success"><i class="fas fa-check-circle"></i><h3>' + activeBookings + '</h3><p>Белсенді брондаулар</p></div>' +
            '<div class="stat-card warning"><i class="fas fa-money-bill-wave"></i><h3>' + totalRevenue.toLocaleString() + ' ₸</h3><p>Жалпы кіріс</p></div>' +
            '<div class="stat-card danger"><i class="fas fa-bed"></i><h3>' + availableRooms + '/' + rooms.length + '</h3><p>Бос бөлмелер</p></div>';

        var self = this;
        var recentBookings = document.getElementById('recentBookings');
        var recent = bookings.slice(-5).reverse();
        recentBookings.innerHTML = '<div class="table-container"><table><thead><tr><th>№</th><th>Клиент</th><th>Бөлме</th><th>Күні</th><th>Сома</th><th>Статус</th></tr></thead><tbody>' +
            recent.map(function(booking) {
                return '<tr><td>#' + booking.id + '</td><td>' + booking.clientName + '</td><td>Бөлме ' + booking.roomName + '</td>' +
                    '<td>' + self.formatDate(booking.checkIn) + ' - ' + self.formatDate(booking.checkOut) + '</td>' +
                    '<td>' + booking.totalPrice.toLocaleString() + ' ₸</td>' +
                    '<td><span class="badge ' + self.getStatusBadge(booking.status) + '">' + booking.status + '</span></td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderAdminRooms: function() {
        var rooms = this.getData('rooms');
        var container = document.getElementById('adminRoomsContainer');

        if (rooms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-bed"></i><h3>Бөлмелер жоқ</h3></div>';
            return;
        }

        container.innerHTML = '<div class="table-container"><table><thead><tr><th>Сурет</th><th>Нөмір</th><th>Түрі</th><th>Сыйымдылық</th><th>Бағасы</th><th>Статус</th><th>Әрекет</th></tr></thead><tbody>' +
            rooms.map(function(room) {
                return '<tr><td><img src="' + room.image + '" style="width: 60px; height: 40px; object-fit: cover; border-radius: 5px;" onerror="this.src=\'https://via.placeholder.com/60x40\'"></td>' +
                    '<td>Бөлме ' + room.name + '</td><td>' + room.type + '</td><td>' + room.capacity + ' адам</td>' +
                    '<td>' + room.price.toLocaleString() + ' ₸</td>' +
                    '<td><span class="badge ' + (room.available ? 'badge-success' : 'badge-danger') + '">' + (room.available ? 'Бос' : 'Толық') + '</span></td>' +
                    '<td><button class="btn btn-secondary btn-sm" onclick="app.editRoom(\'' + room.id + '\')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-danger btn-sm" onclick="app.deleteRoom(\'' + room.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderAdminBookings: function() {
        var bookings = this.getData('bookings');
        var container = document.getElementById('adminBookingsContainer');

        if (bookings.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><h3>Брондаулар жоқ</h3></div>';
            return;
        }

        var self = this;
        container.innerHTML = '<div class="table-container"><table><thead><tr><th>№</th><th>Клиент</th><th>Бөлме</th><th>Кіру</th><th>Шығу</th><th>Қонақтар</th><th>Сома</th><th>Статус</th><th>Әрекет</th></tr></thead><tbody>' +
            bookings.map(function(booking) {
                return '<tr><td>#' + booking.id + '</td><td>' + booking.clientName + '</td><td>Бөлме ' + booking.roomName + '</td>' +
                    '<td>' + self.formatDate(booking.checkIn) + '</td><td>' + self.formatDate(booking.checkOut) + '</td>' +
                    '<td>' + booking.guests + '</td><td>' + booking.totalPrice.toLocaleString() + ' ₸</td>' +
                    '<td><span class="badge ' + self.getStatusBadge(booking.status) + '">' + booking.status + '</span></td>' +
                    '<td>' + (booking.status === 'Күту' ? 
                        '<button class="btn btn-success btn-sm" onclick="app.approveBooking(\'' + booking.id + '\')"><i class="fas fa-check"></i></button> ' +
                        '<button class="btn btn-danger btn-sm" onclick="app.cancelBooking(\'' + booking.id + '\')"><i class="fas fa-times"></i></button>' :
                        '<button class="btn btn-danger btn-sm" onclick="app.deleteBooking(\'' + booking.id + '\')"><i class="fas fa-trash"></i></button>') +
                    '</td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderAdminClients: function() {
        var users = this.getData('users').filter(function(u) { return u.role === 'client'; });
        var bookings = this.getData('bookings');
        var container = document.getElementById('adminClientsContainer');

        container.innerHTML = '<div class="table-container"><table><thead><tr><th>Аты</th><th>Email</th><th>Телефон</th><th>Брондаулар</th><th>Жалпы сома</th></tr></thead><tbody>' +
            users.map(function(user) {
                var userBookings = bookings.filter(function(b) { return b.userId === user.id; });
                var totalSpent = userBookings.reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
                return '<tr><td>' + user.name + '</td><td>' + user.email + '</td><td>' + user.phone + '</td>' +
                    '<td>' + userBookings.length + '</td><td>' + totalSpent.toLocaleString() + ' ₸</td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderAdminReports: function() {
        var bookings = this.getData('bookings');
        var rooms = this.getData('rooms');
        var container = document.getElementById('reportsContainer');

        var totalRevenue = bookings.filter(function(b) { return b.status === 'Расталған'; }).reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
        var pendingRevenue = bookings.filter(function(b) { return b.status === 'Күту'; }).reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
        var cancelledBookings = bookings.filter(function(b) { return b.status === 'Болдырылған'; }).length;

        container.innerHTML = '<div class="stats-grid mb-4"><div class="stat-card success"><i class="fas fa-money-bill-wave"></i><h3>' + totalRevenue.toLocaleString() + ' ₸</h3><p>Расталған кіріс</p></div>' +
            '<div class="stat-card warning"><i class="fas fa-clock"></i><h3>' + pendingRevenue.toLocaleString() + ' ₸</h3><p>Күтілетін кіріс</p></div>' +
            '<div class="stat-card danger"><i class="fas fa-ban"></i><h3>' + cancelledBookings + '</h3><p>Болдырылған брондаулар</p></div></div>' +
            '<h4 class="mb-3">Бөлмелер бойынша статистика</h4>' +
            '<div class="table-container"><table><thead><tr><th>Бөлме</th><th>Түрі</th><th>Брондаулар</th><th>Кіріс</th></tr></thead><tbody>' +
            rooms.map(function(room) {
                var roomBookings = bookings.filter(function(b) { return b.roomId === room.id && b.status === 'Расталған'; });
                var roomRevenue = roomBookings.reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
                return '<tr><td>Бөлме ' + room.name + '</td><td>' + room.type + '</td><td>' + roomBookings.length + '</td><td>' + roomRevenue.toLocaleString() + ' ₸</td></tr>';
            }).join('') + '</tbody></table></div>' +
            '<div style="margin-top: 30px;"><button class="btn btn-primary" onclick="app.exportData()"><i class="fas fa-download"></i> Деректерді экспорттау (JSON)</button></div>';
    },

    renderAdminSettings: function() {
        var settings = this.getData('settings');
        var container = document.getElementById('settingsContainer');

        container.innerHTML = '<div style="max-width: 800px;"><h4 class="mb-3">Қонақүй мәліметтері</h4>' +
            '<div class="form-row"><div class="form-group"><label>Қонақүй атауы</label>' +
            '<input type="text" class="form-control" value="' + settings.hotelName + '" id="settingName"></div>' +
            '<div class="form-group"><label>Валюта</label><input type="text" class="form-control" value="' + settings.currency + '" id="settingCurrency"></div></div>' +
            '<div class="form-group"><label>Мекен-жайы</label><input type="text" class="form-control" value="' + settings.hotelAddress + '" id="settingAddress"></div>' +
            '<div class="form-row"><div class="form-group"><label>Телефон</label>' +
            '<input type="tel" class="form-control" value="' + settings.hotelPhone + '" id="settingPhone"></div>' +
            '<div class="form-group"><label>Email</label><input type="email" class="form-control" value="' + settings.hotelEmail + '" id="settingEmail"></div></div>' +
            '<button class="btn btn-primary" onclick="app.saveSettings()"><i class="fas fa-save"></i> Параметрлерді сақтау</button>' +
            '<hr style="margin: 40px 0; border: none; border-top: 1px solid var(--border);"><h4 class="mb-3" style="color: var(--danger);">Қауіпті аймақ</h4>' +
            '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Барлық деректерді өшіру тек тестілеу мақсатында қолданылады!</div>' +
            '<button class="btn btn-danger" onclick="app.resetData()"><i class="fas fa-trash-restore"></i> Барлық деректерді өшіру</button></div>';
    },

    showBookingModal: function(roomId) {
        var room = this.getData('rooms').find(function(r) { return r.id === roomId; });
        if (!room) return;

        var today = new Date().toISOString().split('T')[0];
        var tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        var modalBody = document.getElementById('bookingModalBody');
        modalBody.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> Бөлме: <strong>' + room.name + '</strong> - ' + room.type + ' (' + room.price.toLocaleString() + ' ₸/түн)</div>' +
            '<div class="form-row"><div class="form-group"><label>Кіру күні</label>' +
            '<input type="date" class="form-control" id="bookingCheckIn" min="' + today + '" value="' + today + '"></div>' +
            '<div class="form-group"><label>Шығу күні</label><input type="date" class="form-control" id="bookingCheckOut" min="' + tomorrow + '" value="' + tomorrow + '"></div></div>' +
            '<div class="form-group"><label>Қонақтар саны</label>' +
            '<input type="number" class="form-control" id="bookingGuests" min="1" max="' + room.capacity + '" value="1"></div>' +
            '<div class="form-group"><label>Ескертпе (міндетті емес)</label>' +
            '<textarea class="form-control" id="bookingNotes" rows="3" placeholder="Қосымша ескертпелер"></textarea></div>' +
            '<div class="alert alert-success" id="bookingTotal"><i class="fas fa-calculator"></i> Жалпы сома: <strong id="totalAmount">0 ₸</strong></div>' +
            '<button class="btn btn-primary" style="width: 100%;" onclick="app.createBooking(\'' + roomId + '\')">' +
            '<i class="fas fa-check"></i> Брондауды растау</button>';

        var checkInInput = document.getElementById('bookingCheckIn');
        var checkOutInput = document.getElementById('bookingCheckOut');
        var calculateTotal = function() {
            var checkIn = new Date(checkInInput.value);
            var checkOut = new Date(checkOutInput.value);
            var nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            if (nights > 0) {
                var total = nights * room.price;
                document.getElementById('totalAmount').textContent = total.toLocaleString() + ' ₸ (' + nights + ' түн)';
            } else {
                document.getElementById('totalAmount').textContent = '0 ₸';
            }
        };
        setTimeout(function() {
            var checkInInput = document.getElementById('bookingCheckIn');
            var checkOutInput = document.getElementById('bookingCheckOut');
            if (checkInInput) checkInInput.addEventListener('change', calculateTotal);
            if (checkOutInput) checkOutInput.addEventListener('change', calculateTotal);
            calculateTotal();
        }, 100);

        document.getElementById('bookingModal').classList.add('active');
    },

    createBooking: function(roomId) {
        var room = this.getData('rooms').find(function(r) { return r.id === roomId; });
        var checkIn = document.getElementById('bookingCheckIn').value;
        var checkOut = document.getElementById('bookingCheckOut').value;
        var guests = parseInt(document.getElementById('bookingGuests').value);
        var notes = document.getElementById('bookingNotes').value;

        if (!checkIn || !checkOut) {
            alert('Күндерді таңдаңыз!');
            return;
        }

        var checkInDate = new Date(checkIn);
        var checkOutDate = new Date(checkOut);
        var nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            alert('Шығу күні кіру күнінен кейін болуы керек!');
            return;
        }

        if (guests > room.capacity) {
            alert('Максимум ' + room.capacity + ' адам!');
            return;
        }

        var bookings = this.getData('bookings');
        var newBooking = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            roomId: room.id,
            roomName: room.name,
            clientName: this.currentUser.name,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            totalPrice: nights * room.price,
            status: 'Күту',
            date: new Date().toISOString().split('T')[0],
            notes: notes
        };

        bookings.push(newBooking);
        this.setData('bookings', bookings);

        this.closeModal('bookingModal');
        alert('Брондау сәтті жасалды! Растауды күтіңіз.');
        this.renderClientBookings();
        this.switchTab('clientBookings');
    },

    cancelBooking: function(bookingId) {
        if (!confirm('Брондауды болдырмауға сенімдісіз бе?')) return;

        var bookings = this.getData('bookings');
        var booking = bookings.find(function(b) { return b.id === bookingId; });
        if (booking) {
            booking.status = 'Болдырылған';
            this.setData('bookings', bookings);
            alert('Брондау болдырылды');
            
            if (this.currentUser.role === 'client') {
                this.renderClientBookings();
            } else {
                this.renderAdminBookings();
            }
        }
    },

    approveBooking: function(bookingId) {
        var bookings = this.getData('bookings');
        var booking = bookings.find(function(b) { return b.id === bookingId; });
        if (booking) {
            booking.status = 'Расталған';
            this.setData('bookings', bookings);
            alert('Брондау расталды');
            this.renderAdminBookings();
            this.renderAdminDashboard();
        }
    },

    deleteBooking: function(bookingId) {
        if (!confirm('Брондауды өшіруге сенімдісіз бе?')) return;

        var bookings = this.getData('bookings');
        bookings = bookings.filter(function(b) { return b.id !== bookingId; });
        this.setData('bookings', bookings);
        alert('Брондау өшірілді');
        this.renderAdminBookings();
    },

    showAddRoomModal: function() {
        var modalBody = document.getElementById('roomModalBody');
        document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-plus"></i> Жаңа бөлме';
        
        modalBody.innerHTML = '<div class="form-group"><label>Бөлме нөмірі</label>' +
            '<input type="text" class="form-control" id="roomName" placeholder="101"></div>' +
            '<div class="form-row"><div class="form-group"><label>Түрі</label><select class="form-control" id="roomType">' +
            '<option>Стандарт</option><option>Люкс</option><option>Апартамент</option></select></div>' +
            '<div class="form-group"><label>Сыйымдылық</label><input type="number" class="form-control" id="roomCapacity" min="1" value="2"></div></div>' +
            '<div class="form-group"><label>Бағасы (түніне)</label><input type="number" class="form-control" id="roomPrice" min="0" value="15000"></div>' +
            '<div class="form-group"><label>Сипаттама</label><textarea class="form-control" id="roomDescription" rows="3" placeholder="Бөлме туралы ақпарат"></textarea></div>' +
            '<div class="form-group"><label>Сурет URL</label><input type="text" class="form-control" id="roomImage" placeholder="https://..."></div>' +
            '<div class="form-group"><label style="display: flex; align-items: center; gap: 8px;">' +
            '<input type="checkbox" id="roomAvailable" checked> Қол жетімді</label></div>' +
            '<button class="btn btn-primary" style="width: 100%;" onclick="app.saveRoom()"><i class="fas fa-save"></i> Сақтау</button>';

        document.getElementById('roomModal').classList.add('active');
    },

    editRoom: function(roomId) {
        var room = this.getData('rooms').find(function(r) { return r.id === roomId; });
        if (!room) return;

        var modalBody = document.getElementById('roomModalBody');
        document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-edit"></i> Бөлмені өңдеу';
        
        modalBody.innerHTML = '<input type="hidden" id="roomId" value="' + room.id + '">' +
            '<div class="form-group"><label>Бөлме нөмірі</label><input type="text" class="form-control" id="roomName" value="' + room.name + '"></div>' +
            '<div class="form-row"><div class="form-group"><label>Түрі</label><select class="form-control" id="roomType">' +
            '<option ' + (room.type === 'Стандарт' ? 'selected' : '') + '>Стандарт</option>' +
            '<option ' + (room.type === 'Люкс' ? 'selected' : '') + '>Люкс</option>' +
            '<option ' + (room.type === 'Апартамент' ? 'selected' : '') + '>Апартамент</option></select></div>' +
            '<div class="form-group"><label>Сыйымдылық</label><input type="number" class="form-control" id="roomCapacity" min="1" value="' + room.capacity + '"></div></div>' +
            '<div class="form-group"><label>Бағасы (түніне)</label><input type="number" class="form-control" id="roomPrice" min="0" value="' + room.price + '"></div>' +
            '<div class="form-group"><label>Сипаттама</label><textarea class="form-control" id="roomDescription" rows="3">' + room.description + '</textarea></div>' +
            '<div class="form-group"><label>Сурет URL</label><input type="text" class="form-control" id="roomImage" value="' + room.image + '"></div>' +
            '<div class="form-group"><label style="display: flex; align-items: center; gap: 8px;">' +
            '<input type="checkbox" id="roomAvailable" ' + (room.available ? 'checked' : '') + '> Қол жетімді</label></div>' +
            '<button class="btn btn-primary" style="width: 100%;" onclick="app.saveRoom()"><i class="fas fa-save"></i> Сақтау</button>';

        document.getElementById('roomModal').classList.add('active');
    },

    saveRoom: function() {
        var idEl = document.getElementById('roomId');
        var id = idEl ? idEl.value : null;
        var name = document.getElementById('roomName').value.trim();
        var type = document.getElementById('roomType').value;
        var capacity = parseInt(document.getElementById('roomCapacity').value);
        var price = parseInt(document.getElementById('roomPrice').value);
        var description = document.getElementById('roomDescription').value.trim();
        var image = document.getElementById('roomImage').value.trim();
        var available = document.getElementById('roomAvailable').checked;

        if (!name || !type || !capacity || !price || !description) {
            alert('Барлық өрістерді толтырыңыз!');
            return;
        }

        var rooms = this.getData('rooms');

        if (id) {
            var self = this;
            var roomIndex = rooms.findIndex(function(r) { return r.id === id; });
            rooms[roomIndex] = { id: id, name: name, type: type, capacity: capacity, price: price, description: description, image: image, available: available };
        } else {
            var newRoom = {
                id: Date.now().toString(),
                name: name,
                type: type,
                capacity: capacity,
                price: price,
                description: description,
                image: image || 'https://via.placeholder.com/300x200?text=Бөлме',
                available: available
            };
            rooms.push(newRoom);
        }

        this.setData('rooms', rooms);
        this.closeModal('roomModal');
        alert('Бөлме сақталды!');
        this.renderAdminRooms();
    },

    deleteRoom: function(roomId) {
        if (!confirm('Бөлмені өшіруге сенімдісіз бе?')) return;

        var rooms = this.getData('rooms');
        rooms = rooms.filter(function(r) { return r.id !== roomId; });
        this.setData('rooms', rooms);
        alert('Бөлме өшірілді');
        this.renderAdminRooms();
    },

    closeModal: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    saveSettings: function() {
        var settings = {
            hotelName: document.getElementById('settingName').value,
            hotelAddress: document.getElementById('settingAddress').value,
            hotelPhone: document.getElementById('settingPhone').value,
            hotelEmail: document.getElementById('settingEmail').value,
            currency: document.getElementById('settingCurrency').value
        };

        this.setData('settings', settings);
        alert('Параметрлер сақталды!');
    },

    resetData: function() {
        if (!confirm('БАРЛЫҚ деректерді өшіруге сенімдісіз бе? Бұл әрекетті қайтару мүмкін емес!')) return;
        if (!confirm('Соңғы растау: Барлық пайдаланушылар, бөлмелер және брондаулар өшіріледі!')) return;

        var variables = ['users', 'rooms', 'bookings', 'session', 'settings'];
        for (var i = 0; i < variables.length; i++) {
            this.setData(variables[i], null);
        }
        
        alert('Барлық деректер өшірілді. Бет жаңартылады.');
        location.reload();
    },

    exportData: function() {
        var data = {
            users: this.getData('users'),
            rooms: this.getData('rooms'),
            bookings: this.getData('bookings'),
            settings: this.getData('settings'),
            exportDate: new Date().toISOString()
        };

        var dataStr = JSON.stringify(data, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'hotel-data-' + Date.now() + '.json';
        link.click();
        URL.revokeObjectURL(url);
    },

    getData: function(key) {
        try {
            var data = window['_' + key] || null;
            return data ? JSON.parse(JSON.stringify(data)) : null;
        } catch (e) {
            return null;
        }
    },

    setData: function(key, value) {
        window['_' + key] = value ? JSON.parse(JSON.stringify(value)) : null;
    },

    formatDate: function(dateStr) {
        var date = new Date(dateStr);
        var months = ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'];
        return date.getDate() + ' ' + months[date.getMonth()];
    },

    getStatusBadge: function(status) {
        var badges = {
            'Күту': 'badge-warning',
            'Расталған': 'badge-success',
            'Болдырылған': 'badge-danger',
            'Аяқталған': 'badge-info'
        };
        return badges[status] || 'badge-info';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    app.init();
});