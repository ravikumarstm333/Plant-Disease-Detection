import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def generate_otp():
    return str(random.randint(1000, 9999))

def send_email(email, otp):
    """
    Sends an OTP via Gmail SMTP.
    Returns True if successfully sent, False otherwise.
    """
    try:
        user = os.getenv("GMAIL_USER")
        pw = os.getenv("GMAIL_APP_PASSWORD")

        if not user or not pw:
            print(f"❌ SMTP Config Missing: USER={bool(user)}, PW={bool(pw)}")
            return False

        # 1. Create the Email Message
        msg = MIMEMultipart()
        msg['From'] = user
        msg['To'] = email
        msg['Subject'] = "OTP Verification - PlantD"
        
        body = f"Your OTP is: {otp}. It is valid for 5 minutes."
        msg.attach(MIMEText(body, 'plain'))

        print(f"🔵 Attempting to send OTP to {email} via Gmail SMTP...")

        # 2. Connect to SMTP Server
        # Gmail uses port 587 for STARTTLS
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        
        # Enable debug level to see the full SMTP conversation in logs
        # server.set_debuglevel(1) 

        print("🔵 Connecting and starting TLS...")
        server.ehlo()  # Identify ourselves to the server
        server.starttls() # Secure the connection
        server.ehlo()

        print("🔵 Logging in to Gmail...")
        server.login(user, pw)
        print("✅ Login successful!")

        print("🔵 Sending message...")
        server.send_message(msg)
        
        print("✅ OTP sent successfully!")
        server.quit()
        return True

    except smtplib.SMTPAuthenticationError:
        print("❌ Authentication Failed: Check if GMAIL_APP_PASSWORD is correct and App Passwords are enabled.")
    except smtplib.SMTPConnectError:
        print("❌ Connection Failed: Could not connect to Gmail SMTP server.")
    except Exception as e:
        print(f"❌ General SMTP Error: {str(e)}")
    
    return False