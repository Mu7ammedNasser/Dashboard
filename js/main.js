function closeNav() {
    $("aside").animate({ left: "-260px" }, 500);
    $(".icon").html(
      `<i class=" i text-black fa-solid open-close-icon fa-2x fa-align-justify"></i>`
    );
    for (let i = 0; i < 5; i++) {
      $("ul li")
        .eq(i)
        .animate(
          {
            top: 300,
          },
          (i + 5) * 10
        );
    }
  }
  
  function openNav() {
    $("aside").animate({ left: "0px" }, 500);
    $(".icon").html(`<i class="i text-black fa-3x fa-solid fa-xmark"></i>`);
    for (let i = 0; i < 5; i++) {
      $("ul li")
        .eq(i)
        .animate(
          {
            top: 0,
          },
          (i + 5) * 100
        );
    }
  }
  
  $(".icon").on("click", function () {
    if ($("aside").css("left") == "0px") {
      closeNav();
    } else {
      openNav();
    }
  });

$(document).ready(function() {
    const tableBody = $('#dataTable tbody');
    const nameFilter = $('#byName');
    const amountFilter = $('#byAmount');
    const transactionsChart = $('#transactionsChart');
    let customers = [];
    let transactions = [];
    let displayedChart = null;

    async function fetchData() {
        try {
            let response = await fetch('../data/db.json');
            let data = await response.json();
            customers = data.customers || [];
            transactions = data.transactions || [];
            displayTable();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function displayTable() {
        tableBody.empty();
        const filteredCustomers = filterCustomersByName(customers, nameFilter.val());
        const filteredTransactions = filterTransactionsByAmount(transactions, amountFilter.val());

        filteredTransactions.forEach(transaction => {
            filteredCustomers.forEach(customer => {
                if (transaction.customer_id === customer.id) {
                    const row = `
                        <tr>
                            <td>${transaction.id}</td>
                            <td>${customer.name}</td>
                            <td>${transaction.date}</td>
                            <td>${transaction.amount}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                }
            });
        });

        
        $('#dataTable tbody tr').on('click', function() {
            const customerId = $(this).find('td:nth-child(2)').text();
            const selectedCustomer = customers.find(customer => customer.name === customerId);
            if (selectedCustomer) {
                displayChart(selectedCustomer);
                scrollToChart();
            }
        });
    }

    function filterCustomersByName(customers, name) {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(name.trim().toLowerCase())
        );
    }

    function filterTransactionsByAmount(transactions, amount) {
        return transactions.filter(transaction =>
            transaction.amount.toString().includes(amount.trim())
        );
    }

    function displayChart(selectedCustomer) {
        const customerTransactions = transactions.filter(t => t.customer_id === selectedCustomer.id);
        const chartData = {
            labels: customerTransactions.map(t => t.date),
            datasets: [{
                label: `${selectedCustomer.name}'s Transactions`,
                data: customerTransactions.map(t => t.amount),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        if (displayedChart) {
            displayedChart.destroy();  
        }
        displayedChart = new Chart(transactionsChart, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount'
                        }
                    }
                }
            }
        });
    }

    function scrollToChart() {
        $('html, body').animate({
            scrollTop: $('#chartContainer').offset().top
        }, 500);
    }

 
    nameFilter.on('input', displayTable);
    amountFilter.on('input', displayTable);

    fetchData();
});
