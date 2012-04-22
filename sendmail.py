import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class EmailSender(object):
    def __init__(self, username, password):
        # Open a connection to the SendGrid mail server
        self.s = smtplib.SMTP('smtp.sendgrid.net', 587)
 
        # Authenticate
        self.s.login(username, password)
 
    def send_mail(self, from_email, to_email, subject, body):
        # sendmail function takes 3 arguments: sender's address, recipient's address
        # and message to send - here it is sent as one string.
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        part1 = MIMEText(body, 'plain')
        msg.attach(part1)
        self.s.sendmail(from_email, to_email, msg.as_string())

    def close(self):
        self.s.quit()
