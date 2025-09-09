import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, CreditCard, TrendingDown, Calendar, X, History } from 'lucide-react';
import './App.css';

const ExpenseDebtTracker = () => {
  const [activeTab, setActiveTab] = useState('gastos');
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Estados para formularios
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'alimentacion',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [debtForm, setDebtForm] = useState({
    creditor: '',
    amount: '',
    description: '',
    dueDate: '',
    status: 'pendiente'
  });

  const [paymentForm, setPaymentForm] = useState({
    debtId: null,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const categories = {
    alimentacion: 'Alimentación',
    transporte: 'Transporte',
    entretenimiento: 'Entretenimiento',
    salud: 'Salud',
    servicios: 'Servicios',
    otros: 'Otros'
  };

  // Agregar gasto
  const addExpense = () => {
    if (expenseForm.description && expenseForm.amount) {
      const newExpense = {
        id: Date.now(),
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };
      setExpenses([...expenses, newExpense]);
      setExpenseForm({
        description: '',
        amount: '',
        category: 'alimentacion',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Agregar deuda
  const addDebt = () => {
    if (debtForm.creditor && debtForm.amount) {
      const newDebt = {
        id: Date.now(),
        ...debtForm,
        amount: parseFloat(debtForm.amount),
        originalAmount: parseFloat(debtForm.amount),
        payments: []
      };
      setDebts([...debts, newDebt]);
      setDebtForm({
        creditor: '',
        amount: '',
        description: '',
        dueDate: '',
        status: 'pendiente'
      });
    }
  };

  // Agregar pago a deuda
  const addPayment = () => {
    if (paymentForm.debtId && paymentForm.amount) {
      const paymentAmount = parseFloat(paymentForm.amount);
      const payment = {
        id: Date.now(),
        amount: paymentAmount,
        date: paymentForm.date,
        description: paymentForm.description
      };

      setDebts(debts.map(debt => {
        if (debt.id === paymentForm.debtId) {
          const newPayments = [...debt.payments, payment];
          const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
          const remainingAmount = debt.originalAmount - totalPaid;
          
          return {
            ...debt,
            payments: newPayments,
            amount: Math.max(0, remainingAmount),
            status: remainingAmount <= 0 ? 'pagada' : 'pendiente'
          };
        }
        return debt;
      }));

      setPaymentForm({
        debtId: null,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setShowPaymentModal(false);
    }
  };

  // Abrir modal de pago
  const openPaymentModal = (debtId) => {
    setPaymentForm({
      ...paymentForm,
      debtId: debtId
    });
    setShowPaymentModal(true);
  };

  // Eliminar gasto
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Eliminar deuda
  const deleteDebt = (id) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Cambiar estado de deuda
  const toggleDebtStatus = (id) => {
    setDebts(debts.map(debt => 
      debt.id === id 
        ? { ...debt, status: debt.status === 'pendiente' ? 'pagada' : 'pendiente' }
        : debt
    ));
  };

  // Calcular totales
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebts = debts.filter(debt => debt.status === 'pendiente')
                        .reduce((sum, debt) => sum + debt.amount, 0);

  // Gastos por categoría
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-4">Control de Finanzas Personales</h1>
          
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-sm opacity-80">Total Gastos</p>
                  <p className="text-2xl font-bold">$COP {totalExpenses.toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-sm opacity-80">Deudas Pendientes</p>
                  <p className="text-2xl font-bold">$COP {totalDebts.toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-sm opacity-80">Balance Neto</p>
                  <p className="text-2xl font-bold">-$COP {(totalExpenses + totalDebts).toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('gastos')}
              className={`px-6 py-3 font-medium ${activeTab === 'gastos' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Gastos
            </button>
            <button
              onClick={() => setActiveTab('deudas')}
              className={`px-6 py-3 font-medium ${activeTab === 'deudas' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Deudas
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-6 py-3 font-medium ${activeTab === 'resumen' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Resumen
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Gastos */}
          {activeTab === 'gastos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario de gastos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Agregar Gasto</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Descripción del gasto"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Monto (ej: 25000)"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addExpense}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar Gasto
                  </button>
                </div>
              </div>

              {/* Lista de gastos */}
              <div>
                <h2 className="text-xl font-bold mb-4">Gastos Recientes</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {expenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay gastos registrados</p>
                  ) : (
                    expenses.map(expense => (
                      <div key={expense.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{expense.description}</h3>
                            <p className="text-sm text-gray-600">
                              {categories[expense.category]} • {expense.date}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-red-600">$COP {expense.amount.toLocaleString('es-CO')}</span>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Deudas */}
          {activeTab === 'deudas' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario de deudas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Agregar Deuda</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Acreedor"
                    value={debtForm.creditor}
                    onChange={(e) => setDebtForm({...debtForm, creditor: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Monto de la deuda (ej: 500000)"
                    value={debtForm.amount}
                    onChange={(e) => setDebtForm({...debtForm, amount: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={debtForm.description}
                    onChange={(e) => setDebtForm({...debtForm, description: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Fecha de vencimiento"
                    value={debtForm.dueDate}
                    onChange={(e) => setDebtForm({...debtForm, dueDate: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addDebt}
                    className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Agregar Deuda
                  </button>
                </div>
              </div>

              {/* Lista de deudas */}
              <div>
                <h2 className="text-xl font-bold mb-4">Lista de Deudas</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {debts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay deudas registradas</p>
                  ) : (
                    debts.map(debt => {
                      const totalPaid = debt.payments ? debt.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
                      const progress = debt.originalAmount ? (totalPaid / debt.originalAmount) * 100 : 0;
                      
                      return (
                        <div key={debt.id} className={`p-4 rounded-lg border ${debt.status === 'pagada' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className={`font-medium ${debt.status === 'pagada' ? 'line-through text-gray-500' : ''}`}>
                                {debt.creditor}
                              </h3>
                              {debt.description && (
                                <p className="text-sm text-gray-600">{debt.description}</p>
                              )}
                              {debt.dueDate && (
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Vence: {debt.dueDate}
                                </p>
                              )}
                              
                              {/* Progreso de pago */}
                              {debt.originalAmount && totalPaid > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Pagado: $COP {totalPaid.toLocaleString('es-CO')}</span>
                                    <span>{progress.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
                              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${debt.status === 'pagada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {debt.status === 'pagada' ? 'Pagada' : 'Pendiente'}
                              </span>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`font-bold ${debt.status === 'pagada' ? 'text-green-600' : 'text-red-600'}`}>
                                $COP {debt.amount.toLocaleString('es-CO')}
                              </span>
                              {debt.originalAmount && debt.originalAmount !== debt.amount && (
                                <span className="text-xs text-gray-500">
                                  Original: $COP {debt.originalAmount.toLocaleString('es-CO')}
                                </span>
                              )}
                              <div className="flex space-x-1">
                                {debt.status === 'pendiente' && (
                                  <button
                                    onClick={() => openPaymentModal(debt.id)}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Pagar
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleDebtStatus(debt.id)}
                                  className={`px-2 py-1 text-xs rounded ${debt.status === 'pagada' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                >
                                  {debt.status === 'pagada' ? 'Reabrir' : 'Saldar'}
                                </button>
                                <button
                                  onClick={() => deleteDebt(debt.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Historial de pagos */}
                          {debt.payments && debt.payments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <History className="h-4 w-4 mr-1" />
                                Historial de Pagos ({debt.payments.length})
                              </h4>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {debt.payments.map(payment => (
                                  <div key={payment.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <div>
                                      <span className="font-medium">$COP {payment.amount.toLocaleString('es-CO')}</span>
                                      <span className="text-gray-600 ml-2">{payment.date}</span>
                                      {payment.description && (
                                        <div className="text-xs text-gray-500">{payment.description}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Resumen */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gastos por categoría */}
                <div className="bg-white p-4 rounded-lg border">
                  <h2 className="text-xl font-bold mb-4">Gastos por Categoría</h2>
                  {Object.keys(expensesByCategory).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span>{categories[category]}</span>
                          <span className="font-bold">$COP {amount.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Estado de deudas */}
                <div className="bg-white p-4 rounded-lg border">
                  <h2 className="text-xl font-bold mb-4">Estado de Deudas</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Deudas Pendientes:</span>
                      <span className="font-bold text-red-600">
                        {debts.filter(d => d.status === 'pendiente').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deudas Pagadas:</span>
                      <span className="font-bold text-green-600">
                        {debts.filter(d => d.status === 'pagada').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total a Pagar:</span>
                      <span className="font-bold text-red-600">$COP {totalDebts.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Últimos movimientos */}
              <div className="bg-white p-4 rounded-lg border">
                <h2 className="text-xl font-bold mb-4">Últimos Movimientos</h2>
                <div className="space-y-3">
                  {[...expenses.slice(-5), ...debts.slice(-5)]
                    .sort((a, b) => new Date(b.date || Date.now()) - new Date(a.date || Date.now()))
                    .slice(0, 10)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">
                            {item.description || item.creditor}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">
                            {item.creditor ? 'Deuda' : 'Gasto'}
                          </span>
                        </div>
                        <span className="font-bold text-red-600">
                          $COP {item.amount.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de registro de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Registrar Pago</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Monto del pago (ej: 100000)"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Descripción del pago (opcional)"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={addPayment}
                  className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                >
                  Registrar Pago
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ExpenseDebtTracker />
    </div>
  );
}

export default App;