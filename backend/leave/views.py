from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Leave
from .serializers import LeaveSerializer
from employees.models import Employee
from django.db.models import Count
from rest_framework.views import APIView
from datetime import datetime, timedelta
from django.db.models import F, ExpressionWrapper, fields, Sum, Q
from collections import defaultdict


class LeavesViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter leaves based on the logged-in user."""
        return Leave.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Override the create method to associate leave with the logged-in user."""
        serializer.save(user=self.request.user)
        
class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override this method to restrict users to their own leave applications.
        """
        return Leave.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def approve_leave(self, request, pk=None):
        """
        Custom action to approve or reject leave by the reporting manager.
        """
        try:
            leave = Leave.objects.get(id=pk)
        except Leave.DoesNotExist:
            return Response({'error': 'Leave not found'}, status=status.HTTP_404_NOT_FOUND)

        # Assuming `approved_by` is a field in your Leave model (e.g., a ForeignKey to the manager)
        if request.user != leave.approved_by:
            return Response({'error': 'You are not authorized to approve this leave.'}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')
        if action not in ['Approved', 'Rejected']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = action  # Assuming status is the field representing the approval state
        leave.save()  
        return Response({'message': f'Leave {action}'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def get_leave_data(self, request):
        """
        Custom action to get leave data for the authenticated user.
        """
        
        leave_data = Leave.objects.all()
       
        serialized_leave_data = LeaveSerializer(leave_data, many=True)
        return Response(serialized_leave_data.data)
    @action(detail=False, methods=['get'])
    def get_user_leave(self, request, pk=None):
        """
        Custom action to get leave data for the authenticated user.
        """       
        leave_data = Leave.objects.filter(user_id= pk)
        print(leave_data)
        serialized_leave_data = LeaveSerializer(leave_data, many=True)
        return Response(serialized_leave_data.data)
    
    @action(detail=False, methods=['delete'])
    def delete_leave_by_values(self, request, pk=None):
        """
        Custom action to delete a leave application by matching all provided field values.
        """
        
        
        try:
            # Filter the Leave records that match all the provided fields
            leave = Leave.objects.get(leave_id=pk)

           
            if not leave:
                return Response({'error': 'Leave record not found.'}, status=status.HTTP_404_NOT_FOUND)

            # print(request.user.is_staff)
            # if not request.user.is_staff:
            #     return Response({'detail': 'You are not authorized to delete this leave.'}, status=status.HTTP_403_FORBIDDEN)
            

            # Delete the leave record
            leave.delete()

            return Response({'message': 'Leave application deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

   
    @action(detail=True, methods=['get'])
    def get_leave_detail(self, request, pk=None):
        """
        Custom action to get the leave details for a specific leave by its ID.
        """

        try:
            leave = Leave.objects.get(leave_id=pk)
        except Leave.DoesNotExist:
            return Response({'error': 'Leave not found'}, status=status.HTTP_404_NOT_FOUND)

        serialized_leave_data = LeaveSerializer(leave)
        return Response(serialized_leave_data.data)

    @action(detail=False, methods=['post'])
    def submit_leave_form(self, request):
        """
        Custom action to submit a leave application form.
        Accepts leave details and creates a new leave record.
        """
        data = request.data
        from_process_date = datetime.strptime(data['fromDate'], "%Y-%m-%d")
        to_process_date = datetime.strptime(data['fromDate'], "%Y-%m-%d")
        if  (from_process_date.weekday() == 6 and to_process_date .weekday() == 6) or (from_process_date == datetime(2024, 12, 25) and to_process_date == datetime(2024, 12, 25)):
            return Response({
                "error": "Leave cannot be applied on Holidays.",
            }, status=status.HTTP_400_BAD_REQUEST)
            
        employee = Employee.objects.get(employee_first_name = data['user_name']) 
        employee_id = employee.employee_id
        data['employee'] = employee_id
        print(data)
        serializer = LeaveSerializer(data=request.data)
        if serializer.is_valid():
            leave = serializer.save(user_id=request.user.id)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)  
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put'])
    def update_leave(self, request, pk=None):
        """
        Custom action to update an existing leave application.
        """
        try:
            leave = Leave.objects.get(leave_id=pk)
        except Leave.DoesNotExist:
            return Response({'error': 'Leave not found'}, status=status.HTTP_404_NOT_FOUND)

        # Assuming only the user who created the leave can update it, or a staff member
        if leave.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You are not authorized to update this leave.'}, status=status.HTTP_403_FORBIDDEN)

        # Deserialize the data to update the leave record
        serializer = LeaveSerializer(leave, data=request.data, partial=True)  # partial=True allows updating specific fields
        if serializer.is_valid():
            serializer.save()  # Save the updated leave data
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put'])
    def approve_leave(self, request, pk=None):
        try:
            leave_request = Leave.objects.get(leave_id=pk)
            new_status = request.data.get("status")
            new_reason = request.data.get("reason")
            if new_status in ["Approved", "Rejected"]:
                leave_request.status = new_status
                leave_request.reason = new_reason
                leave_request.save()
                return Response({"message": "Status updated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        except Leave.DoesNotExist:
            return Response({"error": "Leave request not found"},status=status.HTTP_400_BAD_REQUEST)
    
class LeaveCountView(APIView):
    def get(self, request, pk=None):
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        common_holidays = [
            datetime(current_year, 12, 25), 
            datetime(current_year, 1, 1),    
        ]

        leaves = Leave.objects.filter(
            Q(fromDate__year=current_year, fromDate__month=current_month) |
            Q(toDate__year=current_year, toDate__month=current_month),
            user_id=pk,
            status = "Approved"
        )
        
        leave_data = []
        
        for leave in leaves:
            from_date = leave.fromDate
            to_date = leave.toDate
            
            total_days = (to_date - from_date).days + 1  
            
            valid_days = 0
            for single_date in (from_date + timedelta(n) for n in range(total_days)):
                if single_date.weekday() != 6 and single_date not in common_holidays: 
                    valid_days += 1

            leave_data.append({
                'leave_type': leave.leave_type,
                'valid_days': valid_days,
                'from_date': from_date,
                'to_date': to_date,
            })
        
        leave_count = defaultdict(int)
        
        for leave in leave_data:
            leave_type = leave['leave_type']
            valid_days = leave['valid_days']
            leave_count[leave_type] += valid_days
        print(leave_data)
        casual_leave_limit = 3
        medical_leave_limit = 7
        additional_lop = 0
        
        final_leave_count = {
            'Casual_Leave': 12,
            'Medical_Leave': 7,
            'LOP': 0    
        }

        for leave_type, leavecount in leave_count.items():
            if leave_type == 'Casual Leave' or leave_type == 'Sick Leave':
                if leavecount > casual_leave_limit:
                    additional_lop += leavecount - casual_leave_limit
                    final_leave_count['Casual_Leave'] -= casual_leave_limit  
                else:
                    final_leave_count['Casual_Leave'] -= leavecount
            elif leave_type == 'Medical Leave':
                if leavecount > medical_leave_limit:
                    additional_lop += leavecount - medical_leave_limit
                final_leave_count['Medical_Leave'] -= leavecount
            elif leave_type == 'LOP':
                final_leave_count['LOP'] += leavecount
        
        final_leave_count['LOP'] += additional_lop
        print(final_leave_count)
        
        return Response(final_leave_count, status=status.HTTP_200_OK)
        
