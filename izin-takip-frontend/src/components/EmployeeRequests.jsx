import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

const EmployeeRequests = ({ requests }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        İzin Taleplerim
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlangıç Tarihi</TableCell>
              <TableCell>Bitiş Tarihi</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Açıklama</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{format(new Date(request.startDate), 'dd.MM.yyyy')}</TableCell>
                <TableCell>{format(new Date(request.endDate), 'dd.MM.yyyy')}</TableCell>
                <TableCell>
                  {request.leaveType === 'annual' && 'Yıllık İzin'}
                  {request.leaveType === 'sick' && 'Hastalık İzni'}
                  {request.leaveType === 'emergency' && 'Acil Durum'}
                  {request.leaveType === 'birthday' && 'Doğum Günü'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={request.status} 
                    color={getStatusColor(request.status)} 
                  />
                </TableCell>
                <TableCell>{request.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EmployeeRequests;