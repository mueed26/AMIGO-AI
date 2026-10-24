// Confirm dialog that deletes an agent and its scheduled runs.
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import axios from 'axios'
import { toast } from '@/components/ui/toast'
import { Loader2Icon } from 'lucide-react'

type props = {
    openAlert: boolean,
    agentId: string | undefined,
    closeAlert: any,
    refreshData: any
}

function DeleteAgent({ openAlert, agentId, closeAlert, refreshData }: props) {

    const [loading, setLoading] = useState(false);

    const deleteAgent = async () => {
        setLoading(true);
        try {
            await axios.delete('/api/agent/configure', {
                data: { agentId: agentId }
            });
            // Pass false, not nothing, so the dialog's open state stays a boolean and it closes.
            closeAlert(false);
            toast.add({ type: 'success', title: 'Agent deleted' })
            refreshData()
        } catch (e: any) {
            const error = e?.response?.data?.error;
            const message = typeof error === 'string' ? error : 'Unable to delete agent.';
            toast.add({ type: 'error', title: message })
        } finally {
            // Always re-enable the button, even when the delete fails.
            setLoading(false);
        }

    }

    return (
        <AlertDialog open={!!openAlert} onOpenChange={(open: boolean) => closeAlert(open)}>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
                    <AlertDialogDescription>
                        It stops for good, along with any runs it has lined up. Past results
                        go too. There's no undo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => closeAlert(false)}>Keep it</AlertDialogCancel>
                    <AlertDialogAction variant='destructive' onClick={() => deleteAgent()} disabled={loading}>
                        {loading && <Loader2Icon className='animate-spin' />}
                        Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteAgent