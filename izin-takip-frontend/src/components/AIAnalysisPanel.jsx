import React, { useEffect, useState } from 'react';
import { getAllLeaveRequests } from '../services/api';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF69B4', '#00CED1', '#FFA500'];

const AIAnalysisPanel = () => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    byDepartment: {},
    byAIResult: {}
  });
  const [leaveRequests, setLeaveRequests] = useState([]); // ham veri

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await getAllLeaveRequests();
        // TEST: Yapay veri ekle
        data.push({
          department: "Test Departmanı",
          status: "rejected",
          aiResult: "kıdem"
        });
        setLeaveRequests(data); // ham veriyi kaydet
        const total = data.length;
        const approved = data.filter(r => r.status === 'approved').length;
        const rejected = data.filter(r => r.status === 'rejected').length;
        const byDepartment = {};
        data.forEach(r => {
          if (r.department) byDepartment[r.department] = (byDepartment[r.department] || 0) + 1;
        });
        const byAIResult = {};
        data.forEach(r => {
          if (r.aiResult) byAIResult[r.aiResult] = (byAIResult[r.aiResult] || 0) + 1;
        });
        setStats({ total, approved, rejected, byDepartment, byAIResult });
      } catch {
        setStats({ total: 0, approved: 0, rejected: 0, byDepartment: {}, byAIResult: {} });
        setLeaveRequests([]);
      }
    }
    fetchData();
  }, []);

  // Departman verisini PieChart için diziye çevir
  const departmentData = Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value }));

  // Ay bazlı dağılımı hesapla
  const byMonth = {};
  leaveRequests.forEach(r => {
    const dateStr = r.startDate || r.start_date || r.start;
    if (dateStr) {
      const date = new Date(dateStr);
      const month = date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
  });
  // Ayları kronolojik sırala
  const monthMap = {
    'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
    'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
  };
  const sortedMonthArray = Object.entries(byMonth)
    .map(([ay, count]) => {
      const [monthName, year] = ay.split(' ');
      const monthIndex = monthMap[monthName];
      return { ay, count, date: new Date(Number(year), monthIndex, 1) };
    })
    .sort((a, b) => a.date - b.date)
    .map(({ ay, count }) => ({ ay, count }));

  console.log('leaveRequests:', leaveRequests);
  if (leaveRequests && leaveRequests.length > 0) {
    console.log('İlk 3 kayıt:', leaveRequests.slice(0, 3));
    leaveRequests.slice(0, 3).forEach((r, i) => {
      console.log(`Kayıt ${i + 1}: department=${r.department}, status=${r.status}, aiResult=${r.aiResult}`);
    });
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>AI Analiz Paneli</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Toplam İzin Talebi</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Onaylanan</Typography>
            <Typography variant="h4">{stats.approved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Reddedilen</Typography>
            <Typography variant="h4">{stats.rejected}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, minHeight: 370 }}>
            <Typography variant="subtitle1">Departman Bazlı Dağılım</Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width={250} height={200}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, width: 220, maxHeight: 120, overflowY: 'auto' }}>
                {departmentData.map((item, index) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length], mr: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{item.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Aylara Göre İzin Talebi</Typography>
            <Box sx={{ width: 400, height: 250, mx: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedMonthArray} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                  <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="İzin Talebi" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Kural İhlali ve AI Karşılaştırması Tablosu */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Kural İhlali ve AI Karşılaştırması
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Departman</TableCell>
                <TableCell>Kural Etiketi</TableCell>
                <TableCell>Reddedilen Talep Sayısı</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                // Sadece aiResult alanı dolu olanlar (status filtresi yok)
                const rejectedByAI = leaveRequests.filter(r => r.aiResult && r.aiResult.trim() !== '');
                const grouped = {};
                rejectedByAI.forEach(r => {
                  const dep = r.department || 'Bilinmiyor';
                  const etiket = r.aiResult || 'Bilinmiyor';
                  if (!grouped[dep]) grouped[dep] = {};
                  grouped[dep][etiket] = (grouped[dep][etiket] || 0) + 1;
                });
                const tableRows = [];
                Object.entries(grouped).forEach(([dep, etikets]) => {
                  Object.entries(etikets).forEach(([etiket, count]) => {
                    tableRows.push({ department: dep, etiket, count });
                  });
                });
                if (tableRows.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={3} align="center">AI etiketiyle işaretlenmiş izin talebi bulunamadı.</TableCell>
                    </TableRow>
                  );
                }
                return tableRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.etiket}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AIAnalysisPanel;
