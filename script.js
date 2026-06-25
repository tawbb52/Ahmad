const state = {
    users: [
        { id: 1, username: 'admin', plan: 'Premium', fee: 20, status: 'active', sessions: 1 },
        { id: 2, username: 'viewer_01', plan: 'Standard', fee: 10, status: 'active', sessions: 2 },
        { id: 3, username: 'viewer_02', plan: 'Basic', fee: 6, status: 'inactive', sessions: 0 }
    ],
    channels: [
        { id: 1, name: 'Sports 1', quality: 'FHD', live: true },
        { id: 2, name: 'Movies Max', quality: 'HD', live: true },
        { id: 3, name: 'Kids World', quality: 'SD', live: false }
    ],
    invoices: [
        { id: 1001, user_id: 1, amount: 20, status: 'paid' },
        { id: 1002, user_id: 2, amount: 10, status: 'paid' }
    ],
    securityLogs: [
        'admin: login success',
        'viewer_99: invalid password'
    ]
};

function renderDashboard() {
    const activeUsers = state.users.filter(u => u.status === 'active').length;
    const liveStreams = state.channels.filter(c => c.live).length;
    const dailyRevenue = state.invoices.reduce((sum, i) => sum + Number(i.amount), 0);

    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('channelStats').textContent = `${state.channels.length} / ${liveStreams}`;
    document.getElementById('dailyRevenue').textContent = `$${dailyRevenue.toFixed(2)}`;
}

function renderUsers() {
    const body = document.getElementById('usersTableBody');
    body.innerHTML = '';
    state.users.forEach(user => {
        body.insertAdjacentHTML(
            'beforeend',
            `<tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.plan}</td>
                <td>$${Number(user.fee).toFixed(2)}</td>
                <td>${user.status}</td>
                <td>${user.sessions}</td>
            </tr>`
        );
    });
}

function renderChannels() {
    const grid = document.getElementById('channelsGrid');
    grid.innerHTML = '';
    state.channels.forEach(channel => {
        const statusClass = channel.live ? 'channel-live' : 'channel-offline';
        const statusLabel = channel.live ? 'Live' : 'Offline';
        grid.insertAdjacentHTML(
            'beforeend',
            `<div class="col-12 col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <h3 class="h6">${channel.name}</h3>
                        <p class="mb-1 channel-quality">Quality: ${channel.quality}</p>
                        <p class="mb-0 ${statusClass}">${statusLabel}</p>
                    </div>
                </div>
            </div>`
        );
    });
}

function renderInvoices() {
    const list = document.getElementById('invoiceList');
    list.innerHTML = '';
    state.invoices.slice().reverse().forEach(invoice => {
        list.insertAdjacentHTML(
            'beforeend',
            `<li class="list-group-item d-flex justify-content-between">
                <span>#${invoice.id} User ${invoice.user_id}</span>
                <strong>$${Number(invoice.amount).toFixed(2)}</strong>
            </li>`
        );
    });
}

function renderSecurityLogs() {
    const list = document.getElementById('securityLogs');
    list.innerHTML = '';
    state.securityLogs.slice().reverse().forEach(log => {
        list.insertAdjacentHTML('beforeend', `<li class="list-group-item">${log}</li>`);
    });
}

document.getElementById('addUserBtn').addEventListener('click', () => {
    const id = state.users.length + 1;
    state.users.push({ id, username: `user_${id}`, plan: 'Basic', fee: 5, status: 'active', sessions: 0 });
    state.securityLogs.push(`system: user_${id} created`);
    renderAll();
});

document.getElementById('paymentForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const invoice = {
        id: Date.now(),
        user_id: Number(form.get('user_id')),
        amount: Number(form.get('amount')),
        method: form.get('method'),
        status: 'paid'
    };
    state.invoices.push(invoice);
    state.securityLogs.push(`billing: payment received by ${invoice.method}`);
    event.target.reset();
    renderAll();
});

function renderAll() {
    renderDashboard();
    renderUsers();
    renderChannels();
    renderInvoices();
    renderSecurityLogs();
}

renderAll();
