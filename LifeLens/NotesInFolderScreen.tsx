import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => {},
  error => {
    console.log('Error opening database:', error);
  }
);

// Definir el tipo de ruta para NotesInFolderScreen
type NotesInFolderScreenRouteProp = RouteProp<{ NotesInFolderScreen: { folderId: number } }, 'NotesInFolderScreen'>;

// Definir el tipo de cada elemento en el array de notas
type Note = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  // Añade más propiedades si es necesario
};

const NotesInFolderScreen = ({ route }: { route: NotesInFolderScreenRouteProp }) => {
  const { folderId } = route.params;
  const [notes, setNotes] = useState<Note[]>([]); // Especificar el tipo de notes como Note[]

  useEffect(() => {
    fetchNotesInFolder();
  }, []);

  const fetchNotesInFolder = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notesDB WHERE folder_id = ?', [folderId], (_, { rows }) => {
        const notesArray: Note[] = [];
        for (let i = 0; i < rows.length; i++) {
          notesArray.push(rows.item(i)); // Asegúrate de que rows.item(i) tenga el tipo Note
        }
        setNotes(notesArray);
      });
    });
  };

  const removeFromFolder = (noteId: number) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE notesDB SET folder_id = NULL WHERE id = ?', [noteId], () => {
        fetchNotesInFolder();
      });
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth() + 1; // Sumar 1 porque los meses comienzan desde 0
    const year = date.getFullYear();
    
    // Asegurarse de que los números tengan dos dígitos agregando un cero si es necesario
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');
  
    return `${formattedDay}/${formattedMonth}/${year} ${formattedHours}:${formattedMinutes}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteTitle}>Titulo: {item.title}</Text>
            <Text>Descripción: {item.description}</Text>
            <Text>Prioridad: {item.priority}</Text>
            <Text>Estado: {item.status}</Text>
            <Text style={{ marginBottom: 5 }}>Fecha de Creación: {formatDate(item.created_at)}</Text>
            <Button title="Sacar de la Carpeta" onPress={() => removeFromFolder(item.id)} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noteItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default NotesInFolderScreen;
