import psycopg2

conn = None
cursor = None

try:
    # Use proper psycopg2 connection string format
    conn = psycopg2.connect("host=db port=5432 dbname=quizzy user=quizzy-admin password=test")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM event")  # Calling a stored function
    result = cursor.fetchall()  # Use fetchone() for single result
    print(result)
    conn.commit()
except psycopg2.DatabaseError as e:
    print(f"Database error: {e}")
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
