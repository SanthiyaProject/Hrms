from django.db import models
from employees.models import Employee  

class Leave(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('Sick Leave', 'Sick Leave'),
        ('Casual Leave', 'Casual Leave'),
        ('Annual Leave', 'Annual Leave'),
    ]

    TIME_PERIOD_CHOICES = [
        ('fullDay', 'Full Day'),
        ('firstHalf', 'First Half'),
        ('secondHalf', 'Second Half'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    leave_id = models.AutoField(primary_key=True) 
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE, 
        related_name='leaves'  
    )
    fromDate = models.DateField()  
    toDate = models.DateField()
    leave_type = models.CharField(
        max_length=50,
        choices=LEAVE_TYPE_CHOICES,
        default='Sick Leave',
    )
    time_period = models.CharField(
        max_length=20,
        choices=TIME_PERIOD_CHOICES,
        default='fullDay',
    )
    reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    notify = models.CharField(max_length=20,blank=True, null=True)  
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending',
    )
    user_id = models.IntegerField()
    user_name = models.CharField(max_length=20,blank=True, null=True) 
    user_department = models.CharField(max_length=20,blank=True, null=True)
    cl_availabe = models.IntegerField(default=12)
    ml_availabe = models.IntegerField(default=7)
    lop_count =  models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)  

    def __str__(self):
            return f"{self.employee.employee_first_name} {self.employee.employee_last_name}: {self.leave_type} ({self.fromDate} - {self.toDate})"

    def save(self, *args, **kwargs):
        if self.created_at:
            self.created_at = self.created_at.replace(microsecond=0)
        if self.updated_at:
            self.updated_at = self.updated_at.replace(microsecond=0)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"
