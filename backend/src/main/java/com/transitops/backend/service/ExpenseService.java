package com.transitops.backend.service;

import com.transitops.backend.entity.Expense;
import com.transitops.backend.exception.ResourceNotFoundException;
import com.transitops.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {

    private final ExpenseRepository repository;

    public ExpenseService(ExpenseRepository repository) {
        this.repository = repository;
    }

    public List<Expense> getAllExpenses() {
        return repository.findAll();
    }

    public Expense getExpenseById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found with id " + id));
    }

    public Expense saveExpense(Expense expense) {
        return repository.save(expense);
    }

    public Expense updateExpense(Long id, Expense updatedExpense) {
        return repository.findById(id)
                .map(expense -> {
                    expense.setTrip(updatedExpense.getTrip());
                    expense.setTollExpense(updatedExpense.getTollExpense());
                    expense.setOtherExpense(updatedExpense.getOtherExpense());

                    return repository.save(expense);
                })
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public void deleteExpense(Long id) {
        repository.deleteById(id);
    }
}