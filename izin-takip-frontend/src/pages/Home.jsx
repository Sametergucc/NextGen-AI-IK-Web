import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  Avatar,
  Rating,
  LinearProgress,
  IconButton,
  MobileStepper
} from '@mui/material';
import {
  Analytics,
  Security,
  Speed,
  Group,
  Assessment,
  AutoGraph,
  Login as LoginIcon,
  CheckCircle,
  Business,
  People,
  Work,
  Timeline,
  Psychology,
  Dashboard,
  Description,
  Notifications,
  Settings,
  ArrowForward,
  EventNote,
  CalendarMonth,
  Approval,
  AccessTime,
  History,
  NotificationsActive,
  FormatQuote,
  EmojiEvents,
  SentimentSatisfied,
  SentimentVerySatisfied,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

const FeatureCard = ({ icon, title, description, delay, color }) => (
  <Zoom in={true} style={{ transitionDelay: delay }}>
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, rgba(255, 255, 255, 0.1) 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}30`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0) 100%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease-in-out'
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          background: `linear-gradient(135deg, ${color}25 0%, rgba(255, 255, 255, 0.15) 100%)`,
          boxShadow: `0 12px 40px ${color}20`,
          '&::before': {
            opacity: 1
          },
          '& .icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
            background: `linear-gradient(135deg, ${color}30 0%, rgba(255,255,255,0.1) 100%)`,
            boxShadow: `0 4px 20px ${color}20`
          }
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 2,
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <Box 
          className="icon-wrapper"
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.1) 100%)`,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 20px ${color}15`
          }}
        >
          {React.cloneElement(icon, { sx: { color: color, fontSize: 35 } })}
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 600, 
            mb: 2,
            background: `linear-gradient(45deg, ${color} 30%, #fff 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.8,
            fontSize: '1.1rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {description}
        </Typography>
      </Box>
    </Card>
  </Zoom>
);

const ModuleCard = ({ title, description, icon, features, color }) => (
  <Fade in={true}>
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, rgba(255, 255, 255, 0.1) 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}30`,
        borderRadius: 4,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0) 100%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease-in-out'
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          background: `linear-gradient(135deg, ${color}25 0%, rgba(255, 255, 255, 0.15) 100%)`,
          boxShadow: `0 12px 40px ${color}20`,
          '&::before': {
            opacity: 1
          },
          '& .icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
            background: `linear-gradient(135deg, ${color}30 0%, rgba(255,255,255,0.1) 100%)`,
            boxShadow: `0 4px 20px ${color}20`
          }
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 3,
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <Box 
          className="icon-wrapper"
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3,
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.1) 100%)`,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 20px ${color}15`
          }}
        >
          {React.cloneElement(icon, { sx: { color: color, fontSize: 40 } })}
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 600, 
            mb: 2,
            background: `linear-gradient(45deg, ${color} 30%, #fff 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.8,
            fontSize: '1.1rem',
            mb: 3,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {description}
        </Typography>
      </Box>
      <List dense sx={{ width: '100%' }}>
        {features.map((feature, index) => (
          <ListItem 
            key={index} 
            sx={{ 
              py: 1,
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `${color}10`,
                borderRadius: 1
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, justifyContent: 'center' }}>
              <CheckCircle sx={{ color: color, fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText 
              primary={feature} 
              primaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '1rem',
                  textAlign: 'left',
                  fontWeight: 500
                } 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  </Fade>
);

const TestimonialCard = ({ name, role, image, comment, rating }) => (
  <Fade in={true}>
    <Card 
      sx={{ 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <Avatar
        src={image}
        sx={{ 
          width: 100, 
          height: 100, 
          mb: 3,
          border: '3px solid rgba(255, 255, 255, 0.2)'
        }}
      />
      <FormatQuote sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 40, mb: 2 }} />
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.9)',
          mb: 3,
          fontStyle: 'italic',
          fontSize: '1.1rem',
          lineHeight: 1.8
        }}
      >
        {comment}
      </Typography>
      <Rating value={rating} readOnly sx={{ mb: 2 }} />
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white',
          fontWeight: 600,
          mb: 1
        }}
      >
        {name}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.7)'
        }}
      >
        {role}
      </Typography>
    </Card>
  </Fade>
);

const EmployeeCarousel = ({ employees }) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % employees.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + employees.length) % employees.length);
  };

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      borderRadius: 4,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      p: 3
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}>
        <Box sx={{ 
          position: 'relative',
          width: isMobile ? 200 : 250,
          height: isMobile ? 200 : 250,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <img
            src={employees[activeStep].image}
            alt={employees[activeStep].name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            {employees[activeStep].name}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            {employees[activeStep].role}
          </Typography>
          <Rating 
            value={5} 
            readOnly 
            sx={{ 
              mb: 2,
              '& .MuiRating-iconFilled': {
                color: '#ffd700'
              }
            }} 
          />
          <Box sx={{ 
            position: 'relative',
            mt: 2,
            p: 2,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <FormatQuote sx={{ 
              color: 'rgba(255, 255, 255, 0.3)', 
              fontSize: 40, 
              position: 'absolute',
              top: -10,
              left: 10
            }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                pl: 4,
                pr: 2
              }}
            >
              {employees[activeStep].quote}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 3,
        gap: 2
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton 
          onClick={handleNext}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>
      <MobileStepper
        steps={employees.length}
        position="static"
        activeStep={activeStep}
        sx={{
          mt: 2,
          backgroundColor: 'transparent',
          '& .MuiMobileStepper-dot': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          },
          '& .MuiMobileStepper-dotActive': {
            backgroundColor: 'white'
          }
        }}
      />
    </Box>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <EventNote />,
      title: 'Kolay İzin Talebi',
      description: 'Birkaç tıklama ile izin talebinizi oluşturun. Takvim üzerinden tarih seçimi ve otomatik onay süreci.',
      color: '#2196f3' // Mavi
    },
    {
      icon: <CalendarMonth />,
      title: 'Akıllı Takvim',
      description: 'İzin takviminizi görüntüleyin, çakışmaları önleyin ve departman izin planlamasını optimize edin.',
      color: '#4caf50' // Yeşil
    },
    {
      icon: <Approval />,
      title: 'Hızlı Onay Süreci',
      description: 'Yöneticiler için özel onay paneli. Tek tıkla izin taleplerini onaylayın veya reddedin.',
      color: '#ff9800' // Turuncu
    },
    {
      icon: <AccessTime />,
      title: 'İzin Bakiyesi Takibi',
      description: 'Kalan izin günlerinizi anlık olarak takip edin. Yıllık, hastalık ve diğer izin türlerini yönetin.',
      color: '#9c27b0' // Mor
    },
    {
      icon: <History />,
      title: 'İzin Geçmişi',
      description: 'Tüm izin geçmişinizi görüntüleyin. Onaylanan, reddedilen ve bekleyen taleplerinizi takip edin.',
      color: '#f44336' // Kırmızı
    },
    {
      icon: <NotificationsActive />,
      title: 'Anlık Bildirimler',
      description: 'İzin talebinizin durumu değiştiğinde anında bildirim alın. E-posta ve uygulama içi bildirimler.',
      color: '#00bcd4' // Turkuaz
    }
  ];

  const modules = [
    {
      title: 'Çalışan Paneli',
      description: 'Çalışanların izin taleplerini yönetebilecekleri ve takip edebilecekleri kullanıcı dostu panel.',
      icon: <People />,
      color: '#2196f3', // Mavi
      features: [
        'Yeni izin talebi oluşturma',
        'İzin bakiyesi görüntüleme',
        'Talep durumu takibi',
        'İzin geçmişi görüntüleme',
        'Takvim entegrasyonu'
      ]
    },
    {
      title: 'Yönetici Paneli',
      description: 'Yöneticilerin departman izinlerini yönetebilecekleri ve onaylayabilecekleri kapsamlı panel.',
      icon: <Dashboard />,
      color: '#4caf50', // Yeşil
      features: [
        'İzin taleplerini onaylama/reddetme',
        'Departman izin takvimi',
        'Çalışan izin bakiyeleri',
        'Raporlama ve analiz',
        'Toplu izin yönetimi'
      ]
    },
    {
      title: 'İK Yönetim Paneli',
      description: 'İK departmanının tüm izin süreçlerini yönetebileceği ve raporlayabileceği merkezi panel.',
      icon: <Work />,
      color: '#ff9800', // Turuncu
      features: [
        'İzin politikası yönetimi',
        'Departman bazlı raporlar',
        'İzin kullanım analizleri',
        'Çalışan izin limitleri',
        'Sistem ayarları'
      ]
    }
  ];

  const employees = [
    {
      name: "Ahmet Yılmaz",
      role: "Proje Müdürü",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      quote: "Talenteer'da çalışmak benim için büyük bir ayrıcalık. İzin yönetim sistemimiz sayesinde iş-yaşam dengesini çok daha iyi kurabiliyorum."
    },
    {
      name: "Ayşe Demir",
      role: "İK Uzmanı",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
      quote: "Yeni izin yönetim sistemimiz sayesinde tüm süreçler çok daha şeffaf ve verimli hale geldi. Çalışanlarımızın memnuniyeti gözle görülür şekilde arttı."
    },
    {
      name: "Mehmet Kaya",
      role: "Mühendis",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      quote: "İzin taleplerimi kolayca oluşturabiliyor ve takip edebiliyorum. Sistem gerçekten kullanıcı dostu ve pratik."
    },
    {
      name: "Zeynep Şahin",
      role: "Mimar",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
      quote: "İzin planlamamı yaparken takvim entegrasyonu çok işime yarıyor. Artık iş ve özel hayatımı çok daha iyi dengeleyebiliyorum."
    }
  ];

  const satisfactionMetrics = [
    {
      title: "İzin Kullanım Memnuniyeti",
      value: 95,
      icon: <SentimentVerySatisfied sx={{ color: '#4caf50', fontSize: 40 }} />
    },
    {
      title: "Sistem Kullanım Kolaylığı",
      value: 92,
      icon: <EmojiEvents sx={{ color: '#ff9800', fontSize: 40 }} />
    },
    {
      title: "Genel Memnuniyet",
      value: 94,
      icon: <SentimentSatisfied sx={{ color: '#2196f3', fontSize: 40 }} />
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 100%)',
          backdropFilter: 'blur(2px)'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 12, 
            mt: 4,
            animation: 'fadeIn 1s ease-in'
          }}
        >
          <Fade in={true} timeout={1000}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em'
              }}
            >
              Talenteer İnşaat A.Ş.
            </Typography>
          </Fade>
          <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.8rem' },
                fontStyle: 'italic',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              "İnsan Odaklı İnşaat, Akıllı Çözümler"
            </Typography>
          </Fade>
          <Fade in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                mb: 6,
                opacity: 0.8,
                maxWidth: '800px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.2rem' },
                lineHeight: 1.8,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              1999'dan bu yana Türkiye'nin dört bir yanında insan odaklı ve sürdürülebilir projelere imza atıyoruz. 
              Şirketimizin en değerli varlığı olan 50 çalışanımızın refahı ve motivasyonu, her zaman önceliğimiz olmuştur.
            </Typography>
          </Fade>
          <Fade in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon />}
              sx={{
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                py: 2,
                px: 6,
                fontSize: '1.2rem',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                }
              }}
            >
              Giriş Yap
            </Button>
          </Fade>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 8,
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                borderRadius: 2
              }
            }}
          >
            Özellikler
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
                <FeatureCard {...feature} delay={`${index * 150}ms`} color={feature.color} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Modules Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 8,
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                borderRadius: 2
              }
            }}
          >
            Sistem Modülleri
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {modules.map((module, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <ModuleCard {...module} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Employee Carousel Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 8,
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                borderRadius: 2
              }
            }}
          >
            Çalışanlarımız
          </Typography>
          <EmployeeCarousel employees={employees} />
        </Box>

        {/* Statistics Section */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 6,
            mb: 8,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  1000+
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Aktif Kullanıcı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  %99
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Memnuniyet Oranı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  24/7
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Destek
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  50+
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Departman
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Satisfaction Metrics Section */}
        <Box 
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 6,
            mb: 8,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 6,
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Memnuniyet Metrikleri
          </Typography>
          <Grid container spacing={4}>
            {satisfactionMetrics.map((metric, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {metric.icon}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white',
                      mt: 2,
                      mb: 2
                    }}
                  >
                    {metric.title}
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {metric.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      mt: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: metric.icon.props.color
                      }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 