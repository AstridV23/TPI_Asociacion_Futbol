import React from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom"; 
import useAxios from '../hooks/useAxios'
import { toast } from "react-toastify";

function Inicio() {
    const {register, handleSubmit, formState:{errors, isSubmitting}} = useForm();

    const { login} = useAuth();
    const navigate = useNavigate();
    const api = useAxios();


    const onSubmit = async (data) => {
        // Aquí irá la lógica de inicio de sesión

         const transformedData = {
             ...data,
             DNI: parseInt(data.DNI, 10)
         };

         try {
             const response = await api.post("login", transformedData);
            
             // Chequear si la estructura de la respuesta es la esperada
            if (response.status === 200 && response.data) {
               const { DNI, Rol } = response.data;
               toast.success("Secion iniciada correctamente!")
  
               // Guarda el token y el rol en el contexto usando el hook useAuth
               login(Rol, DNI);
               navigate('/inscripciones');
              
            
             } else {
               throw new Error('Respuesta inesperada del servidor');
             }
        
           } catch (error) {
                toast.error("Error al inicar secion");
             // Verifica si el error es de red o falta de respuesta
             if (!error?.response) {
               setError("root", {
                 message: "Error al intentar conectarse con el servidor",
               });
             }
             else {
               // Muestra el error inesperado durante la autenticación
             setError("root", {
                message: "Error inesperado durante el inicio de sesión",
              });
            }
           }
    }

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
                maxWidth: '500px',
                margin: 'auto',
                padding: 2
            }}
        >
            <h1 style={{ textAlign: 'center', color: 'black', margin: '0 0 20px 0' }}>
                Inicia Sesión
            </h1>

            <TextField 
                {...register("DNI", { required: "DNI es necesario" })}
                fullWidth
                label="DNI" 
                variant="outlined"
                error={!!errors.DNI}
                helperText={errors.DNI?.message}
            />

            <TextField 
                {...register("Contrasena", { required: "Contraseña es necesaria" })}
                fullWidth
                type="password"
                label="Contraseña" 
                variant="outlined"
                error={!!errors.Contrasena}
                helperText={errors.Contrasena?.message}
            />

            {errors.root && (
                <div style={{color: 'red', textAlign: 'center', margin: '10px 0'}}>
                    {errors.root.message}
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                }}
            >
                {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
            </button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    ¿No tienes una cuenta?
                </Typography>
                <Button
                    variant="text"
                    onClick={() => navigate('/registro')}
                    sx={{ mt: 1 }}
                >
                    Regístrate
                </Button>
            </Box>
        </Box>
    );
}

export default Inicio;